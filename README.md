# Nursery Zelenas - Питомник щенков

Веб-сайт питомника щенков с системой управления объявлениями, новостями и сообщениями.

## Технологии

### Backend
- **Node.js** с **Express.js**
- **SQLite** с **Sequelize ORM**
- **JWT** для аутентификации
- **bcryptjs** для хеширования паролей
- **multer** для загрузки файлов

### Frontend
- **React.js** с **Material-UI**
- **React Router** для навигации
- **Context API** для управления состоянием

## Установка и запуск

### 1. Клонирование репозитория
```bash
git clone <repository-url>
cd Nursery_Zelenas
```

### 2. Установка зависимостей
```bash
# Установка зависимостей сервера и клиента
npm run install-all
```

### 3. Настройка окружения
Создайте файл `.env` в корневой папке:
```env
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
NODE_ENV=development
```

### 4. Запуск приложения
```bash
# Запуск в режиме разработки (сервер + клиент)
npm run dev
```

Приложение будет доступно по адресам:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Структура базы данных

### Таблицы
- **users** - пользователи (обычные пользователи и владельцы)
- **puppies** - объявления о продаже щенков
- **news** - новости питомника
- **messages** - сообщения между пользователями

### Связи
- Пользователи могут создавать объявления о щенках
- Пользователи могут отправлять сообщения владельцам
- Владельцы могут публиковать новости

## API Endpoints

### Аутентификация
- `POST /api/auth/login` - вход в систему
- `POST /api/auth/register` - регистрация
- `GET /api/auth/me` - получение данных текущего пользователя
- `GET /api/auth/test-owner` - создание тестового владельца

### Щенки
- `GET /api/puppies` - получение списка щенков
- `GET /api/puppies/:id` - получение информации о щенке
- `POST /api/puppies` - создание объявления (только владелец)
- `PUT /api/puppies/:id` - обновление объявления (только владелец)
- `DELETE /api/puppies/:id` - удаление объявления (только владелец)
- `GET /api/puppies/owner/my` - объявления владельца

### Новости
- `GET /api/news` - получение списка новостей
- `GET /api/news/:id` - получение новости
- `POST /api/news` - создание новости (только владелец)
- `PUT /api/news/:id` - обновление новости (только владелец)
- `DELETE /api/news/:id` - удаление новости (только владелец)
- `GET /api/news/owner/my` - новости владельца

### Сообщения
- `POST /api/messages` - отправка сообщения
- `GET /api/messages/puppy/:puppyId` - сообщения по щенку (владелец)
- `GET /api/messages/owner/all` - все сообщения владельца
- `GET /api/messages/user/sent` - отправленные сообщения пользователя
- `POST /api/messages/reply/:messageId` - ответ на сообщение (владелец)
- `PUT /api/messages/:messageId/read` - отметить как прочитанное
- `GET /api/messages/unread/count` - количество непрочитанных сообщений

## Создание владельца

Для тестирования можно создать владельца через API:

```bash
curl -X GET http://localhost:5000/api/auth/test-owner
```

Или вручную через POST запрос:

```bash
curl -X POST http://localhost:5000/api/auth/create-owner \
  -H "Content-Type: application/json" \
  -d '{
    "phone": "+70000000001",
    "password": "Admin",
    "name": "Владелец питомника"
  }'
```

## Особенности

1. **Аутентификация по номеру телефона** - используется российский формат (+7XXXXXXXXXX)
2. **Роли пользователей** - обычные пользователи и владельцы
3. **Загрузка изображений** - поддержка JPG, PNG, WebP до 5MB
4. **Система сообщений** - связь между покупателями и владельцами
5. **Управление контентом** - владельцы могут публиковать новости и объявления

## Разработка

### Структура проекта
```
Nursery_Zelenas/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # React компоненты
│   │   ├── pages/         # Страницы приложения
│   │   ├── contexts/      # React контексты
│   │   └── App.js         # Главный компонент
├── server/                # Node.js backend
│   ├── config/           # Конфигурация БД
│   ├── models/           # SQL модели
│   ├── routes/           # API маршруты
│   ├── middleware/       # Middleware
│   └── index.js          # Главный файл сервера
├── uploads/              # Загруженные файлы
└── database.sqlite       # SQLite база данных
```

### Команды разработки
```bash
npm run dev          # Запуск в режиме разработки
npm run server       # Только сервер
npm run client       # Только клиент
npm run build        # Сборка клиента
```

## Лицензия

MIT License 