import logging
from telegram import Update, ReplyKeyboardMarkup
from telegram.ext import (
    ApplicationBuilder,
    CommandHandler,
    ConversationHandler,
    MessageHandler,
    ContextTypes,
    filters,
)

logging.basicConfig(level=logging.INFO)

test_user = {
    "id": 1,
    "name": "Test User",
    "telegram_id": None,
    "orders": []
}

DELIVERY_TYPES = {
    "Стандарт(~ 5 дней)\n200 тыс. руб за кг": 200000,
    "Экспресс(~ 2 часа)\n400 тыс. руб за кг": 400000,
    "Минимум(~ 7 дней)\n100 тыс. руб за кг": 100000,
}

SENDER_NAME, RECEIVER_NAME, WEIGHT, TYPE_DELIVERY, SELECT_CANCEL_ORDER, SELECT_PAYMENT_ORDER, SELECT_PAYMENT_METHOD = range(7)

def main_keyboard():
    return ReplyKeyboardMarkup([["Создать заказ", "Просмотреть заказы"]], resize_keyboard=True)

def cancel_keyboard():
    return ReplyKeyboardMarkup([["Отмена"]], resize_keyboard=True)

def delivery_type_keyboard():
    return ReplyKeyboardMarkup([
        ["Стандарт(~ 5 дней)\n200 тыс. руб за кг", "Экспресс(~ 2 часа)\n400 тыс. руб за кг"],
        ["Минимум(~ 7 дней)\n100 тыс. руб за кг", "Отмена"]
    ], resize_keyboard=True)

def payment_methods_keyboard():
    return ReplyKeyboardMarkup([
        ["Наличные в пункте приёма заказа"],
        ["Картой в пункте приема заказов"],
        ["Криптовалюта"],
        ["Отмена"]
    ], resize_keyboard=True)

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    telegram_id = update.effective_user.id
    test_user["telegram_id"] = telegram_id
    await update.message.reply_text(
        f"Привет, {test_user['name']}!\nТвой Telegram ID: {telegram_id}\nВыберите действие:",
        reply_markup=main_keyboard()
    )


async def orders(update: Update, context: ContextTypes.DEFAULT_TYPE):
    orders = test_user.get("orders", [])
    if not orders:
        await update.message.reply_text("У вас нет заказов.", reply_markup=main_keyboard())
    else:
        msg = "Ваши заказы:\n\n"
        pending_orders_exist = False
        unpaid_orders_exist = False
        cancelable_orders_exist = False
        
        for order in orders:
            msg += f"ID: {order['id']}\nСтатус: {order['status']}\nОтправитель: {order['sender_name']}\nПолучатель: {order['receiver_name']}\nВес: {order['weight']} кг\nТип доставки: {order.get('type_delivery', 'не указан')}\nЦена: {order['price']} руб\n\n"
            
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
            
        if keyboard:
            await update.message.reply_text(
                msg,
                reply_markup=ReplyKeyboardMarkup(keyboard, resize_keyboard=True)
            )
        else:
            await update.message.reply_text(msg, reply_markup=main_keyboard())

async def create_order_start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text(
        "Введите ФИО отправителя:",
        reply_markup=cancel_keyboard()
    )
    return SENDER_NAME

async def sender_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    context.user_data["new_order"] = {"sender_name": update.message.text.strip()}
    await update.message.reply_text(
        "Введите ФИО получателя:",
        reply_markup=cancel_keyboard()
    )
    return RECEIVER_NAME

async def receiver_name(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    context.user_data["new_order"]["receiver_name"] = update.message.text.strip()
    await update.message.reply_text(
        "Введите вес посылки в кг:",
        reply_markup=cancel_keyboard()
    )
    return WEIGHT

async def weight(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    try:
        weight = float(update.message.text.strip())
        if weight <= 0:
            raise ValueError("Вес должен быть положительным числом")
        context.user_data["new_order"]["weight"] = weight
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

    new_id = max([o["id"] for o in test_user["orders"]], default=0) + 1
    context.user_data["new_order"]["id"] = new_id
    context.user_data["new_order"]["status"] = "waiting_payment"
    context.user_data["new_order"]["date"] = "2025-09-04"
    context.user_data["new_order"]["cargos"] = []

    test_user["orders"].append(context.user_data["new_order"])
    
    await update.message.reply_text(
        f"Заказ создан!\nID: {new_id}\nОтправитель: {context.user_data['new_order']['sender_name']}\nПолучатель: {context.user_data['new_order']['receiver_name']}\nВес: {weight} кг\nТип доставки: {delivery_type}\nЦена: {total_price} руб\n\nСтатус: Ожидает оплаты", 
        reply_markup=main_keyboard()
    )
    return ConversationHandler.END

async def cancel(update: Update, context: ContextTypes.DEFAULT_TYPE):
    await update.message.reply_text("Действие отменено.", reply_markup=main_keyboard())
    return ConversationHandler.END

async def start_cancel_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    cancelable_orders = [o for o in test_user["orders"] if o["status"] in ["waiting_payment", "pending"]]
    if not cancelable_orders:
        await update.message.reply_text("Нет заказов, которые можно отменить.", reply_markup=main_keyboard())
        return ConversationHandler.END

    msg = "Заказы, которые можно отменить:\n\n"
    for order in cancelable_orders:
        msg += f"ID: {order['id']}, Отправитель: {order['sender_name']} → Получатель: {order['receiver_name']}, Вес: {order['weight']} кг, Тип доставки: {order.get('type_delivery', 'не указан')}, Цена: {order['price']} руб, Статус: {order['status']}\n"
    
    msg += "\nВведите ID заказа для отмены:"
    await update.message.reply_text(msg, reply_markup=cancel_keyboard())
    return SELECT_CANCEL_ORDER

async def select_cancel_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    try:
        order_id = int(update.message.text.strip())
    except ValueError:
        await update.message.reply_text(
            "Неверный формат ID. Введите число:",
            reply_markup=cancel_keyboard()
        )
        return SELECT_CANCEL_ORDER
    
    order_to_cancel = None
    for order in test_user["orders"]:
        if order["id"] == order_id and order["status"] in ["waiting_payment", "pending"]:
            order_to_cancel = order
            break
    
    if order_to_cancel:
        order_to_cancel["status"] = "cancelled"
        await update.message.reply_text(
            f"Заказ ID {order_id} отменен.", 
            reply_markup=main_keyboard()
        )
        return ConversationHandler.END
    else:
        await update.message.reply_text(
            "Заказ с указанным ID не найден или его нельзя отменить.",
            reply_markup=cancel_keyboard()
        )
        return SELECT_CANCEL_ORDER

async def start_payment_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
    unpaid_orders = [o for o in test_user["orders"] if o["status"] == "waiting_payment"]
    if not unpaid_orders:
        await update.message.reply_text("Нет заказов, ожидающих оплаты.", reply_markup=main_keyboard())
        return ConversationHandler.END
    
    msg = "Заказы, ожидающие оплаты:\n\n"
    for order in unpaid_orders:
        msg += f"ID: {order['id']}, Отправитель: {order['sender_name']} → Получатель: {order['receiver_name']}, Вес: {order['weight']} кг, Тип доставки: {order.get('type_delivery', 'не указан')}, Цена: {order['price']} руб\n"
    
    msg += "\nВведите ID заказа для оплаты:"
    await update.message.reply_text(msg, reply_markup=cancel_keyboard())
    return SELECT_PAYMENT_ORDER

async def select_payment_order(update: Update, context: ContextTypes.DEFAULT_TYPE):
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
    for order in test_user["orders"]:
        if order["id"] == order_id and order["status"] == "waiting_payment":
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
    if update.message.text == "Отмена":
        return await cancel(update, context)
    
    payment_method = update.message.text.strip()
    order_to_pay = context.user_data.get("payment_order")
    
    if order_to_pay:
        order_to_pay["status"] = "pending"
        order_to_pay["payment_method"] = payment_method
        
        await update.message.reply_text(
            f"Заказ ID {order_to_pay['id']} оплачен!\nСпособ оплаты: {payment_method}\nСтатус заказа изменен на 'Ожидает обработки'.",
            reply_markup=main_keyboard()
        )
        return ConversationHandler.END
    else:
        await update.message.reply_text(
            "Ошибка при обработке оплаты. Попробуйте снова.",
            reply_markup=main_keyboard()
        )
        return ConversationHandler.END

def main():
    app = ApplicationBuilder().token("8254837265:AAFQ_7zOrcbtvFQxj_4weFnOlcGaHI5ee5M").build()

    conv_create = ConversationHandler(
        entry_points=[MessageHandler(filters.Regex("^Создать заказ$"), create_order_start)],
        states={
            SENDER_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, sender_name)],
            RECEIVER_NAME: [MessageHandler(filters.TEXT & ~filters.COMMAND, receiver_name)],
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

    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.Regex("^Просмотреть заказы$"), orders))
    app.add_handler(conv_create)
    app.add_handler(conv_cancel_order)
    app.add_handler(conv_payment_order)

    print("Бот запущен...")
    app.run_polling()

if __name__ == "__main__":
    main()