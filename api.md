📦 Delivery Service API

Все запросы (кроме register и login) требуют JWT-токен в заголовке:

Authorization: Bearer <token>
Content-Type: application/json
Accept: application/json

🔐 Аутентификация
Регистрация

POST /api/register
Request: name, email, password, password_confirmation
Response: access_token, token_type, expires_in

Логин

POST /api/login
Request: email, password
Response: access_token, token_type, expires_in

Текущий пользователь

POST /api/me
Response: данные пользователя

Выход

POST /api/logout
Response: message "Successfully logged out"

Обновление токена

POST /api/refresh
Response: access_token, token_type, expires_in

📦 Заказы
Получить все заказы пользователя

GET /api/orders
Response: список заказов текущего пользователя с массивом грузов

Создать заказ

POST /api/orders
Request: from_address, to_address, price (опционально), cargos (массив объектов с title, weight, size, type)
Response: созданный заказ с его грузами

Просмотр заказа

GET /api/orders/{id}
Response: заказ с массивом грузов

Обновление заказа

PUT /api/orders/{id}
Можно обновлять только заказы со статусом pending.
Request: from_address, to_address, price (опционально), cargos (каждый элемент может содержать id для обновления груза, либо быть новым без id)
Response: статус updated

Удаление заказа

DELETE /api/orders/{id}
Response: статус deleted