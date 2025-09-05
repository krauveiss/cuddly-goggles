import logging
import re
import aiohttp
import asyncio
import os
from telegram import Update, ReplyKeyboardMarkup, InlineKeyboardMarkup, InlineKeyboardButton
from telegram.ext import (
    ApplicationBuilder, 
    CommandHandler,
    ConversationHandler,
    MessageHandler,
    ContextTypes,
    filters,
    CallbackQueryHandler
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

users_db = {}
all_orders = []

ORDER_STATUSES = {
    "pending": "Ожидает обработки",
    "in_progress": "В процессе доставки",
    "delivered": "Доставлен",
    "cancelled": "Отменен"
}

PLACE_STATUSES = {
    "client": "У клиента",
    "warehouse": "На складе", 
    "elevator": "В лифте"
}

DELIVERY_TYPES = {
    "Стандарт": 200000,
    "Экспресс": 400000,
    "Минимум": 100000,
}

# Состояния
(WEIGHT, TYPE_DELIVERY, SELECT_CANCEL_ORDER, 
 SELECT_PAYMENT_ORDER, SELECT_PAYMENT_METHOD, WORKER_PANEL, 
 SELECT_ORDER_ACTION, SELECT_ORDER_FOR_ACTION, CONFIRM_ACTION) = range(9)

def get_user(telegram_id):
    return users_db.get(telegram_id)

def main_keyboard(user):
    if not user or not user.get("verified"):
        return ReplyKeyboardMarkup([["Верификация"]], resize_keyboard=True)
    elif user.get("role") == "worker":
        return ReplyKeyboardMarkup([["РАБОЧИЙ"]], resize_keyboard=True)
    else:
        return ReplyKeyboardMarkup([["Создать заказ", "Просмотреть заказы"]], resize_keyboard=True)

def cancel_keyboard():
    return ReplyKeyboardMarkup([["Отмена"]], resize_keyboard=True)

def delivery_type_keyboard():
    return ReplyKeyboardMarkup([
        ["Стандарт", "Экспресс"],
        ["Минимум", "Отмена"]
    ], resize_keyboard=True)

def payment_methods_keyboard():
    return ReplyKeyboardMarkup([
        ["Наличные в пункте приёма заказа"],
        ["Картой в пункте приема заказов"],
        ["Криптовалюта"],
        ["Отмена"]
    ], resize_keyboard=True)

def worker_panel_keyboard():
    return ReplyKeyboardMarkup([
        ["Все заказы", "Заказы на складе"],
        ["Заказы в лифте", "Вернуться в меню"]
    ], resize_keyboard=True)

def order_actions_keyboard(order):
    """
    Формирует InlineKeyboardMarkup для действий с заказом.
    Разделяет действия на смену статуса и перемещение заказа.
    """
    from telegram import InlineKeyboardMarkup, InlineKeyboardButton

    keyboard = []

    status = order.get("status")
    place = order.get("place")

    
    if status == "pending":
        keyboard.append([InlineKeyboardButton("Начать обработку (in_progress)", callback_data="set_in_progress")])
    elif status == "in_progress":
        keyboard.append([InlineKeyboardButton("Отметить как доставленный", callback_data="set_delivered")])
        keyboard.append([InlineKeyboardButton("Отменить заказ", callback_data="set_cancelled")])
    elif status == "delivered":
        keyboard.append([InlineKeyboardButton("Вернуть в обработку", callback_data="set_in_progress")])
        keyboard.append([InlineKeyboardButton("Отменить заказ", callback_data="set_cancelled")])
    elif status == "cancelled":
        keyboard.append([InlineKeyboardButton("Вернуть в обработку", callback_data="set_in_progress")])

    if status in ["pending", "in_progress"]:
        if place == "client":
            keyboard.append([InlineKeyboardButton("Переместить на склад", callback_data="move_warehouse")])
        elif place == "warehouse":
            keyboard.append([InlineKeyboardButton("Переместить в лифт", callback_data="move_elevator")])
            keyboard.append([InlineKeyboardButton("Вернуть клиенту", callback_data="move_client")])
        elif place == "elevator":
            keyboard.append([InlineKeyboardButton("Доставить клиенту", callback_data="move_client")])
            keyboard.append([InlineKeyboardButton("Вернуть на склад", callback_data="move_warehouse")])

    keyboard.append([InlineKeyboardButton("Назад", callback_data="back")])

    return InlineKeyboardMarkup(keyboard)

async def change_order_place(order_id, place):
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }
    data = {"order_id": order_id, "place": place}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/service/changeplace",
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return True, result
                else:
                    error_text = await response.text()
                    return False, f"Ошибка сервера: {response.status}, {error_text}"
    except Exception as e:
        return False, f"Ошибка соединения: {str(e)}"

async def change_order_status(order_id, status, place=None):
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }
    
    data = {
        "order_id": order_id,
        "status": status
    }
    
    if place:
        data["place"] = place
    
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/service/changestatus",
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return True, result
                else:
                    error_text = await response.text()
                    return False, f"Ошибка сервера: {response.status}, {error_text}"
    except Exception as e:
        return False, f"Ошибка соединения: {str(e)}"


async def notify_user(app, telegram_id, order_id, new_status, new_place=None):
    try:
        status_text = ORDER_STATUSES.get(new_status, new_status)
        message = f"Статус вашего заказа #{order_id} изменен: {status_text}"
        
        if new_place:
            place_text = PLACE_STATUSES.get(new_place, new_place)
            message += f" ({place_text})"
        
        await app.bot.send_message(chat_id=telegram_id, text=message)
        return True
    except Exception as e:
        logger.error(f"Не удалось отправить уведомление пользователю {telegram_id}: {str(e)}")
        return False

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if not user:
        user = {
            "id": telegram_id,
            "name": update.effective_user.full_name,
            "telegram_id": telegram_id,
            "verified": False,
            "orders": []
        }
        users_db[telegram_id] = user
    
    greeting = f"Привет, {user['name']}!\nТвой Telegram ID: {telegram_id}"
    
    if user.get("verified"):
        role = user.get("role", "client")
        if role == "worker":
            greeting += "\n\nСтатус: РАБОЧИЙ"
        else:
            greeting += "\n\nСтатус: КЛИЕНТ"
    else:
        greeting += "\nСтатус: НЕ ВЕРИФИЦИРОВАН"
    
    await update.message.reply_text(
        greeting + "\nВыберите действие:",
        reply_markup=main_keyboard(user)
    )
async def verification(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if not user:
        await update.message.reply_text("Пользователь не найден. Начните с /start")
        return
    
    if user.get("verified"):
        await update.message.reply_text("Вы уже верифицированы.", reply_markup=main_keyboard(user))
        return
    
    await update.message.reply_text("Отправляем запрос на сервер для верификации...")
    
    try:
        request_data = {"telegram_id": str(telegram_id)}  
        logger.info(f"Отправка запроса на сервер: {request_data}")
        
        headers = {
            "Accept": "application/json",
            "X-Telegram-Bot-Api-Secret-Token": "123"
        }
        
        logger.info(f"Заголовки запроса: {headers}")
        logger.info(f"URL запроса: http://172.20.179.82:8000/api/telegram/getuser")
        
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/getuser",
                json=request_data, 
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
             
                logger.info(f"Статус ответа сервера: {response.status}")
                logger.info(f"Заголовки ответа: {dict(response.headers)}")
                
                response_text = await response.text()
                logger.info(f"Ответ сервера: {response_text}")
                
          
                content_type = response.headers.get('Content-Type', '').lower()
                
                if response.status == 200:
                    if 'application/json' in content_type:
                        
                        try:
                            data = await response.json()
                            logger.info(f"Данные от сервера: {data}")
                            
                            
                            user["verified"] = True
                            user["role"] = data.get("role", "client")
                            user["name"] = data.get("name", user["name"])
                            user["email"] = data.get("email", "")
                            user["tg"] = data.get("tg", "")
                            
                            role_text = "РАБОЧИЙ" if user["role"] == "worker" else "КЛИЕНТ"
                            await update.message.reply_text(
                                f"Верификация успешна!\nИмя: {user['name']}\nРоль: {role_text}\nEmail: {user.get('email', 'не указан')}",
                                reply_markup=main_keyboard(user)
                            )
                        except Exception as e:
                            error_msg = f"Ошибка парсинга JSON: {str(e)}"
                            logger.error(error_msg)
                            await update.message.reply_text(
                                "Ошибка при обработке ответа сервера.",
                                reply_markup=main_keyboard(user)
                            )
                    else:
         
                        error_msg = f"Сервер вернул не JSON ответ. Content-Type: {content_type}"
                        logger.error(error_msg)
                        

                        if "error" in response_text.lower() or "exception" in response_text.lower():
                            await update.message.reply_text(
                                "Ошибка на сервере при верификации.",
                                reply_markup=main_keyboard(user)
                            )
                        else:
                            await update.message.reply_text(
                                "Сервер вернул неожиданный ответ.",
                                reply_markup=main_keyboard(user)
                            )
                else:
                    error_msg = f"Ошибка верификации. Статус сервера: {response.status}"
                    logger.error(error_msg)
                    await update.message.reply_text(
                        f"Ошибка верификации. Код: {response.status}",
                        reply_markup=main_keyboard(user)
                    )
    except asyncio.TimeoutError:
        error_msg = "Таймаут при обращении к серверу. Попробуйте позже."
        logger.error(error_msg)
        await update.message.reply_text(
            error_msg,
            reply_markup=main_keyboard(user)
        )
    except aiohttp.ClientError as e:
        error_msg = f"Ошибка сети при обращении к серверу: {str(e)}"
        logger.error(error_msg)
        await update.message.reply_text(
            error_msg,
            reply_markup=main_keyboard(user)
        )
    except Exception as e:
        error_msg = f"Ошибка при верификации: {str(e)}"
        logger.error(error_msg)
        await update.message.reply_text(
            error_msg,
            reply_markup=main_keyboard(user)
        )

async def orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)

    if not user or not user.get("verified"):
        await update.message.reply_text("Сначала пройдите верификацию.", reply_markup=main_keyboard(user))
        return

    if user.get("role") == "worker":
        await update.message.reply_text("У вас нет доступа к этой функции.", reply_markup=main_keyboard(user))
        return


    request_data = {"telegram_id": str(telegram_id)}
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }

    orders_list = []
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/orders",
                json=request_data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                resp_text = await response.text()
                if response.status == 200:
                    data = await response.json()
                    if isinstance(data, list): 
                        orders_list = data
                    elif isinstance(data, dict) and "orders" in data:
                        orders_list = data["orders"]
                    else:
                        logger.error(f"Неожиданный формат ответа: {data}")
                else:
                    logger.error(f"Ошибка получения заказов. Код: {response.status}, ответ: {resp_text}")
                    await update.message.reply_text("Ошибка при запросе заказов с сервера.", reply_markup=main_keyboard(user))
                    return
    except Exception as e:
        logger.error(f"Ошибка сети при запросе заказов: {e}")
        await update.message.reply_text("Не удалось подключиться к серверу заказов.", reply_markup=main_keyboard(user))
        return

    if not orders_list:
        await update.message.reply_text("У вас нет заказов.", reply_markup=main_keyboard(user))
        return

    msg = "Ваши заказы:\n\n"
    pending_orders_exist = False
    unpaid_orders_exist = False
    cancelable_orders_exist = False

    for order in orders_list:
        status_text = ORDER_STATUSES.get(order['status'], order['status'])
        if order.get('place'):
            status_text += f" ({PLACE_STATUSES.get(order['place'], order['place'])})"
        
        msg += (
            f"ID: {order['id']}\n"
            f"Статус: {status_text}\n"
            f"Вес: {order.get('weight', 0)} г\n"
            f"Тип доставки: {order.get('type_delivery', 'не указан')}\n"
            f"Цена: {order.get('price', 0)} руб\n\n"
        )

        if order['status'] == 'pending':
            pending_orders_exist = True
            cancelable_orders_exist = True
        elif order['status'] == 'waiting_payment':
            unpaid_orders_exist = True
            cancelable_orders_exist = True

    keyboard = []
    if cancelable_orders_exist:
        keyboard.append(["Отменить заказ"])
    if unpaid_orders_exist:
        keyboard.append(["Оплатить заказ"])
    keyboard.append(["Отмена"])

    if keyboard:
        await update.message.reply_text(
            msg,
            reply_markup=ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
        )
    else:
        await update.message.reply_text(msg, reply_markup=main_keyboard(user))


        


async def create_order_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if not user or not user.get("verified"):
        await update.message.reply_text("Сначала пройдите верификацию.", reply_markup=main_keyboard(user))
        return
    
    if user.get("role") == "worker":
        await update.message.reply_text("У вас нет доступа к этой функции.", reply_markup=main_keyboard(user))
        return
    
    await update.message.reply_text(
        "Введите вес посылки в г",
        reply_markup=cancel_keyboard()
    )
    return WEIGHT


async def weight(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    try:
        weight = float(update.message.text.strip())
        if weight <= 0:
            raise ValueError("Вес должен быть положительным числом")
        context.user_data["new_order"] = {"weight": weight}
    except ValueError:
        await update.message.reply_text(
            "Некорректный вес. Введите положительное число:",
            reply_markup=cancel_keyboard()
        )
        return WEIGHT
    
    await update.message.reply_text(
        "Выберите тип доставки:",
        reply_markup=delivery_type_keyboard()
    )
    return TYPE_DELIVERY

async def type_delivery(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)

    if update.message.text == "Отмена":
        return await cancel(update, context)

    delivery_type = update.message.text.strip()

    if delivery_type not in DELIVERY_TYPES:
        await update.message.reply_text(
            "Пожалуйста, выберите тип доставки из предложенных вариантов:",
            reply_markup=delivery_type_keyboard()
        )
        return TYPE_DELIVERY

    context.user_data["new_order"]["type_delivery"] = delivery_type

    weight = context.user_data["new_order"]["weight"]
    price_per_kg = DELIVERY_TYPES[delivery_type]
    total_price = weight * price_per_kg

    context.user_data["new_order"]["price"] = total_price

    new_id = max([o["id"] for o in all_orders], default=0) + 1
    context.user_data["new_order"]["id"] = new_id
    context.user_data["new_order"]["status"] = "pending"
    context.user_data["new_order"]["place"] = "client"
    context.user_data["new_order"]["date"] = "2025-09-04"
    context.user_data["new_order"]["cargos"] = []
    context.user_data["new_order"]["user_id"] = user["id"]
    context.user_data["new_order"]["telegram_id"] = str(telegram_id) 

    request_data = {
        "type_delivery": delivery_type,
        "date_delivery": context.user_data["new_order"]["date"],
        "cargos": [
            {
                "type":"cargo",
                "title": f"Посылка",
                "weight": weight,
                "size": "10x10x10" 
            }
        ],
        "price": total_price,
        "telegram_id": str(telegram_id)  
    }

    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/order",
                json=request_data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                resp_text = await response.text()
                if response.status == 200:
                    data = await response.json()
                    logger.info(f"Заказ успешно создан на сервере: {data}")
                else:
                    logger.error(f"Ошибка при создании заказа. Код: {response.status}, ответ: {resp_text}")
    except Exception as e:
        logger.error(f"Ошибка сети при создании заказа: {e}")

    user["orders"].append(context.user_data["new_order"])
    all_orders.append(context.user_data["new_order"])

    await update.message.reply_text(
        f"Заказ создан!\nID: {new_id}\nВес: {weight} г\nТип доставки: {delivery_type}\nЦена: {total_price} руб\n\nСтатус: Ожидает обработки",
        reply_markup=main_keyboard(user)
    )
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    await update.message.reply_text("Действие отменено.", reply_markup=main_keyboard(user))
    return ConversationHandler.END

async def start_cancel_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }
    data = {"telegram_id": str(telegram_id)}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/orders",
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status != 200:
                    await update.message.reply_text(f"Ошибка при получении заказов. Код: {response.status}", reply_markup=main_keyboard(None))
                    return ConversationHandler.END

                orders_list = await response.json()
                if not orders_list:
                    await update.message.reply_text("У вас нет заказов.", reply_markup=main_keyboard(None))
                    return ConversationHandler.END

                msg = "Ваши заказы:\n\n"
                for order in orders_list:
                    status_text = ORDER_STATUSES.get(order['status'], order['status'])
                    if order.get('place'):
                        status_text += f" ({PLACE_STATUSES.get(order['place'], order['place'])})"
                    msg += f"ID: {order['id']}, Статус: {status_text}, Тип доставки: {order.get('type_delivery','-')}, Цена: {order.get('price',0)} руб\n"
                
                await update.message.reply_text(msg)
                await update.message.reply_text("Введите ID заказа для удаления:", reply_markup=cancel_keyboard())
                return SELECT_CANCEL_ORDER
    except Exception as e:
        await update.message.reply_text(f"Ошибка подключения к серверу: {e}", reply_markup=main_keyboard(None))
        return ConversationHandler.END



async def select_cancel_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id

    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    try:
        order_id = int(update.message.text.strip())
    except ValueError:
        await update.message.reply_text("Неверный ID заказа. Введите число:", reply_markup=cancel_keyboard())
        return SELECT_CANCEL_ORDER

    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }

    url = f"http://172.20.179.82:8000/api/telegram/deleteorder/{order_id}"
    data = {"telegram_id": str(telegram_id)} 

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                url,
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                resp_text = await response.text()
                if response.status == 200:
                    await update.message.reply_text(
                        f"Заказ ID {order_id} успешно удалён.",
                        reply_markup=main_keyboard(None)
                    )
                    return ConversationHandler.END
                else:
                    await update.message.reply_text(
                        f"Не удалось удалить заказ. Сервер вернул: {resp_text}",
                        reply_markup=cancel_keyboard()
                    )
                    return SELECT_CANCEL_ORDER
    except Exception as e:
        await update.message.reply_text(
            f"Ошибка подключения к серверу: {e}",
            reply_markup=cancel_keyboard()
        )
        return SELECT_CANCEL_ORDER

async def start_payment_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if not user or not user.get("verified"):
        await update.message.reply_text("Сначала пройдите верификацию.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    if user.get("role") == "worker":
        await update.message.reply_text("У вас нет доступа к этой функции.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    unpaid_orders = [o for o in user["orders"] if o["status"] == "pending"]
    if not unpaid_orders:
        await update.message.reply_text("Нет заказов, ожидающих оплаты.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    msg = "Заказы, ожидающие оплаты:\n\n"
    for order in unpaid_orders:
        msg += f"ID: {order['id']}, Вес: {order['weight']} г, Тип доставки: {order.get('type_delivery', 'не указан')}, Цена: {order['price']} руб\n"
    
    msg += "\nВведите ID заказа для оплата:"
    await update.message.reply_text(msg, reply_markup=cancel_keyboard())
    return SELECT_PAYMENT_ORDER

async def select_payment_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    try:
        order_id = int(update.message.text.strip())
    except ValueError:
        await update.message.reply_text(
            "Неверный формат ID. Введите число:",
            reply_markup=cancel_keyboard()
        )
        return SELECT_PAYMENT_ORDER
    
    order_to_pay = None
    for order in user["orders"]:
        if order["id"] == order_id and order["status"] == "pending":
            order_to_pay = order
            break
    
    if order_to_pay:
        context.user_data["payment_order"] = order_to_pay
        await update.message.reply_text(
            f"Выбран заказ ID {order_id} для оплаты.\nСумма к оплате: {order_to_pay['price']} руб\n\nВыберите способ оплаты:",
            reply_markup=payment_methods_keyboard()
        )
        return SELECT_PAYMENT_METHOD
    else:
        await update.message.reply_text(
            "Заказ с указанным ID не найден или уже оплачен.",
            reply_markup=cancel_keyboard()
        )
        return SELECT_PAYMENT_ORDER

async def select_payment_method(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    payment_method = update.message.text.strip()
    order_to_pay = context.user_data.get("payment_order")
    
    if order_to_pay:
        order_to_pay["status"] = "pending"
        order_to_pay["payment_method"] = payment_method

        for global_order in all_orders:
            if global_order["id"] == order_to_pay["id"]:
                global_order["status"] = "pending"
                global_order["payment_method"] = payment_method
                break
        
        await update.message.reply_text(
            f"Заказ ID {order_to_pay['id']} оплачен!\nСпособ оплаты: {payment_method}\nСтатус заказа изменен на 'Ожидает обработки'.",
            reply_markup=main_keyboard(user)
        )
        return ConversationHandler.END
    else:
        await update.message.reply_text(
            "Ошибка при обработке оплаты. Попробуйте снова.",
            reply_markup=main_keyboard(user)
        )
        return ConversationHandler.END

async def worker_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if not user or not user.get("verified"):
        await update.message.reply_text("Сначала пройдите верификация.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    if user.get("role") != "worker":
        await update.message.reply_text("У вас нет доступа к панели рабочего.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    await update.message.reply_text(
        "Панель рабочего. Выберите действие:",
        reply_markup=worker_panel_keyboard()
    )
    return WORKER_PANEL

async def show_orders(update: Update, context: ContextTypes.DEFAULT_TYPE, status_filter=None, place_filter=None):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    if not user or not user.get("verified") or user.get("role") != "worker":
        await update.message.reply_text("Доступ запрещён.", reply_markup=main_keyboard(user))
        return WORKER_PANEL

    # Фильтруем заказы
    if status_filter or place_filter:
        if status_filter and place_filter:
            orders_list = [o for o in all_orders if o["status"] == status_filter and o.get("place") == place_filter]
            filter_name = f"Заказы со статусом {ORDER_STATUSES.get(status_filter, status_filter)} и местом {PLACE_STATUSES.get(place_filter, place_filter)}"
        elif status_filter:
            orders_list = [o for o in all_orders if o["status"] == status_filter]
            filter_name = f"Заказы со статусом {ORDER_STATUSES.get(status_filter, status_filter)}"
        else:
            orders_list = [o for o in all_orders if o.get("place") == place_filter]
            filter_name = f"Заказы с местом {PLACE_STATUSES.get(place_filter, place_filter)}"
    else:
        orders_list = all_orders
        filter_name = "Все заказы"

    if not orders_list:
        await update.message.reply_text(f"{filter_name} не найдены.", reply_markup=worker_panel_keyboard())
        return WORKER_PANEL

    msg = f"{filter_name}:\n\n"
    for order in orders_list:
        status_text = ORDER_STATUSES.get(order['status'], order['status'])
        if order.get('place'):
            status_text += f" ({PLACE_STATUSES.get(order['place'], order['place'])})"
        user_info = users_db.get(order.get("user_id", 0), {})
        msg += (
            f"ID: {order['id']}\n"
            f"Статус: {status_text}\n"
            f"Клиент: {user_info.get('name', 'Неизвестно')}\n"
            f"Вес: {order['weight']} г\n"
            f"Тип доставки: {order.get('type_delivery', 'не указан')}\n"
            f"Цена: {order['price']} руб\n\n"
        )

    keyboard = []
    for order in orders_list:
        if order["status"] in ["pending", "in_progress"]:
            keyboard.append([InlineKeyboardButton(f"Действия с заказом ID: {order['id']}", callback_data=f"action_{order['id']}")])
    if keyboard:
        keyboard.append([InlineKeyboardButton("Назад", callback_data="back_to_panel")])

    await update.message.reply_text(msg, reply_markup=InlineKeyboardMarkup(keyboard))
    return WORKER_PANEL

async def worker_get_all_orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }
    data = {"telegram_id": str(telegram_id)}

    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                "http://172.20.179.82:8000/api/telegram/service/orders",
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                resp_text = await response.text()

                if response.status != 200:
                    await update.message.reply_text(
                        f"Ошибка при получении заказов. Код: {response.status}\nОтвет сервера: {resp_text}",
                        reply_markup=main_keyboard(None)
                    )
                    return

                data = await response.json()

                if not isinstance(data, list) or not data:
                    await update.message.reply_text("Заказы не найдены.", reply_markup=main_keyboard(None))
                    return

                msg = "Все заказы:\n\n"

                for order in data:
                    if isinstance(order, list) and order:
                        order = order[0]
                    elif not isinstance(order, dict):
                        continue

                    status_text = ORDER_STATUSES.get(order.get('status', ''), order.get('status', 'Неизвестно'))
                    place_text = PLACE_STATUSES.get(order.get('place', ''), order.get('place', 'Неизвестно'))
                    msg += (
                        f"ID заказа: {order.get('id', '-')}\n"
                        f"ID пользователя: {order.get('user_id', '-')}\n"
                        f"Статус: {status_text} ({place_text})\n"
                        f"Тип доставки: {order.get('type_delivery', '-')}\n"
                        f"Цена: {order.get('price', '-')}\n\n"
                    )

                await update.message.reply_text(msg, reply_markup=worker_panel_keyboard())

    except Exception as e:
        await update.message.reply_text(
            f"Ошибка при подключении к серверу заказов: {e}",
            reply_markup=main_keyboard(None)
        )


async def handle_worker_panel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    
    if not user or not user.get("verified"):
        await update.message.reply_text("Сначала пройдите верификацию.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    if user.get("role") != "worker":
        await update.message.reply_text("У вас нет доступа к панели рабочего.", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    
    text = update.message.text
    if text == "Все заказы":
        await worker_get_all_orders(update, context)
        return WORKER_PANEL
    elif text == "Заказы на складе":
        return await show_orders(update, context, "in_progress", "warehouse")
    elif text == "Заказы в лифте":
        return await show_orders(update, context, "in_progress", "elevator")
    elif text == "Вернуться в меню":
        await update.message.reply_text("Главное меню:", reply_markup=main_keyboard(user))
        return ConversationHandler.END
    else:
        await update.message.reply_text("Неизвестная команда.", reply_markup=worker_panel_keyboard())
        return WORKER_PANEL


async def handle_order_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)
    if not user or not user.get("verified") or user.get("role") != "worker":
        await query.edit_message_text("Доступ запрещён.")
        return ConversationHandler.END

    if query.data == "back_to_panel":
        await query.edit_message_text(
            "Панель рабочего. Выберите действие:",
            reply_markup=worker_panel_keyboard()
        )
        return WORKER_PANEL

    if query.data.startswith("action_"):
        order_id = int(query.data.split("_")[1])
        context.user_data["selected_order_id"] = order_id
        order = next((o for o in all_orders if o["id"] == order_id), None)
        if not order:
            await query.edit_message_text("Заказ не найден.", reply_markup=worker_panel_keyboard())
            return WORKER_PANEL
        await query.edit_message_text(
            f"Заказ ID: {order_id}\n"
            f"Статус: {ORDER_STATUSES.get(order['status'], order['status'])} "
            f"({PLACE_STATUSES.get(order.get('place'), order.get('place'))})\n\n"
            "Выберите действие:",
            reply_markup=order_actions_keyboard(order)
        )
        return SELECT_ORDER_ACTION

async def change_order_place(order_id, new_place):
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }
    data = {"order_id": order_id, "place": new_place}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"http://172.20.179.82:8000/api/telegram/service/changeplace/{order_id}",
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return True, result
                else:
                    error_text = await response.text()
                    return False, f"Ошибка сервера: {response.status}, {error_text}"
    except Exception as e:
        return False, f"Ошибка соединения: {str(e)}"
async def change_order_status_worker(order_id, new_status):
    headers = {
        "Accept": "application/json",
        "X-Telegram-Bot-Api-Secret-Token": "123"
    }
    data = {"order_id": order_id, "status": new_status}
    try:
        async with aiohttp.ClientSession() as session:
            async with session.post(
                f"http://172.20.179.82:8000/api/telegram/service/changestatus/{order_id}",
                json=data,
                headers=headers,
                timeout=aiohttp.ClientTimeout(total=10)
            ) as response:
                if response.status == 200:
                    result = await response.json()
                    return True, result
                else:
                    error_text = await response.text()
                    return False, f"Ошибка сервера: {response.status}, {error_text}"
    except Exception as e:
        return False, f"Ошибка соединения: {str(e)}"



async def handle_selected_action(update: Update, context: ContextTypes.DEFAULT_TYPE):
    query = update.callback_query
    await query.answer()
    telegram_id = update.effective_user.id
    user = get_user(telegram_id)

    if not user or not user.get("verified") or user.get("role") != "worker":
        await query.edit_message_text("Доступ запрещён.")
        return ConversationHandler.END

    if query.data == "back":
        await worker_get_all_orders(update, context)
        return WORKER_PANEL

    order_id = context.user_data.get("selected_order_id")
    if not order_id:
        await query.edit_message_text("Ошибка: заказ не выбран.", reply_markup=worker_panel_keyboard())
        return WORKER_PANEL
    if query.data.startswith("set_"):
        new_status = query.data[4:]
        success, result = await change_order_status_worker(order_id, new_status)
        if success:
            await query.edit_message_text(
                f"Статус заказа ID {order_id} изменен на: {ORDER_STATUSES.get(new_status, new_status)}",
                reply_markup=order_actions_keyboard(result)
            )   
            # Уведомление клиента
            target_user_id = result.get("user_id")
            if target_user_id:
                await notify_user(update.application, target_user_id, order_id, new_status, result.get("place"))
        else:
            await query.edit_message_text(f"Ошибка при смене статуса: {result}", reply_markup=order_actions_keyboard(order))
        return SELECT_ORDER_ACTION

    if query.data.startswith("move_"):
        new_place = query.data[5:]
        success, result = await change_order_place(order_id, new_place)
        if success:
            await query.edit_message_text(
                f"Заказ ID {order_id} перемещён в: {PLACE_STATUSES.get(new_place, new_place)}",
                reply_markup=order_actions_keyboard(result)
            )
            target_user_id = result.get("user_id")
            if target_user_id:
                await notify_user(update.application, target_user_id, order_id, result.get("status"), new_place)
        else:
            await query.edit_message_text(f"Ошибка при перемещении заказа: {result}", reply_markup=order_actions_keyboard(order))
        return SELECT_ORDER_ACTION




def main():
    app = ApplicationBuilder().token("8254837265:AAFQ_7zOrcbtvFQxj_4weFnOlcGaHI5ee5M").build()

    conv_create = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex("^Создать заказ$"), create_order_start)],
        states={
            WEIGHT: [MessageHandler(filters.TEXT & ~filters.COMMAND, weight)],
            TYPE_DELIVERY: [MessageHandler(filters.TEXT & ~filters.COMMAND, type_delivery)],
        },
        fallbacks=[
            MessageHandler(filters.Regex("^Отмена$"), cancel),
            CommandHandler("cancel", cancel)
        ]
    )

    conv_cancel_order = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex("^Отменить заказ$"), start_cancel_order)],
        states={
            SELECT_CANCEL_ORDER: [MessageHandler(filters.TEXT & ~filters.COMMAND, select_cancel_order)]
        },
        fallbacks=[
            MessageHandler(filters.Regex("^Отмена$"), cancel),
            CommandHandler("cancel", cancel)
        ]
    )

    conv_payment_order = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex("^Оплатить заказ$"), start_payment_order)],
        states={
            SELECT_PAYMENT_ORDER: [MessageHandler(filters.TEXT & ~filters.COMMAND, select_payment_order)],
            SELECT_PAYMENT_METHOD: [MessageHandler(filters.TEXT & ~filters.COMMAND, select_payment_method)]
        },
        fallbacks=[
            MessageHandler(filters.Regex("^Отмена$"), cancel),
            CommandHandler("cancel", cancel)
        ]
    )

    conv_worker_panel = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex("^РАБОЧИЙ$"), worker_panel)],
        states={
            WORKER_PANEL: [
                MessageHandler(filters.TEXT & ~filters.COMMAND, handle_worker_panel),
                CallbackQueryHandler(handle_order_action),
            ],
            SELECT_ORDER_ACTION: [CallbackQueryHandler(handle_selected_action)]
        },
        fallbacks=[
            MessageHandler(filters.Regex("^Вернуться в меню$"), cancel),
            CommandHandler("cancel", cancel)
        ]
    )

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.Regex("^Верификация$"), verification))
    app.add_handler(MessageHandler(filters.Regex("^Просмотреть заказы$"), orders))
    app.add_handler(conv_create)
    app.add_handler(conv_cancel_order)
    app.add_handler(conv_payment_order)
    app.add_handler(conv_worker_panel)
    app.add_handler(MessageHandler(filters.Regex("^Отмена$"), cancel))

    logger.info("Бот запущен...")
    app.run_polling()

if __name__ == "__main__":
    main()