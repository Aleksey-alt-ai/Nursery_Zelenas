# Тестирование API в PowerShell

## Создание владельца

```powershell
# Создание тестового владельца
Invoke-WebRequest -Uri "http://localhost:5000/api/auth/test-owner" -Method GET
```

## Вход в систему

```powershell
# Вход владельца
$loginData = @{
    phone = "+70000000001"
    password = "Admin"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
```

## Получение данных пользователя

```powershell
# Получение данных текущего пользователя (требует токен)
$headers = @{
    "Authorization" = "Bearer YOUR_JWT_TOKEN"
}

Invoke-WebRequest -Uri "http://localhost:5000/api/auth/me" -Method GET -Headers $headers
```

## Работа с щенками

```powershell
# Получение списка щенков
Invoke-WebRequest -Uri "http://localhost:5000/api/puppies" -Method GET

# Получение конкретного щенка
Invoke-WebRequest -Uri "http://localhost:5000/api/puppies/1" -Method GET

# Создание объявления (требует токен владельца)
$puppyData = @{
    name = "Бобик"
    breed = "Лабрадор"
    age = 3
    gender = "male"
    color = "Черный"
    price = 25000
    description = "Красивый щенок лабрадора"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/puppies" -Method POST -Body $puppyData -ContentType "application/json" -Headers $headers
```

## Работа с новостями

```powershell
# Получение списка новостей
Invoke-WebRequest -Uri "http://localhost:5000/api/news" -Method GET

# Создание новости (требует токен владельца)
$newsData = @{
    title = "Новые щенки в питомнике"
    content = "У нас появились новые щенки породы лабрадор. Все щенки здоровы и готовы к переезду в новые семьи."
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/news" -Method POST -Body $newsData -ContentType "application/json" -Headers $headers
```

## Работа с сообщениями

```powershell
# Отправка сообщения (требует токен)
$messageData = @{
    puppyId = 1
    content = "Здравствуйте! Интересует этот щенок. Можно ли приехать посмотреть?"
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/messages" -Method POST -Body $messageData -ContentType "application/json" -Headers $headers

# Получение сообщений владельца
Invoke-WebRequest -Uri "http://localhost:5000/api/messages/owner/all" -Method GET -Headers $headers

# Получение количества непрочитанных сообщений
Invoke-WebRequest -Uri "http://localhost:5000/api/messages/unread/count" -Method GET -Headers $headers
```

## Полезные команды

```powershell
# Проверка статуса сервера
Invoke-WebRequest -Uri "http://localhost:5000" -Method GET

# Проверка портов
netstat -an | findstr :5000
netstat -an | findstr :3000

# Остановка процессов на портах
# Для остановки сервера на порту 5000:
# taskkill /F /PID $(netstat -ano | findstr :5000 | awk '{print $5}')

# Для остановки клиента на порту 3000:
# taskkill /F /PID $(netstat -ano | findstr :3000 | awk '{print $5}')
```

## Пример полного тестирования

```powershell
# 1. Создаем владельца
$owner = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/test-owner" -Method GET
Write-Host "Владелец создан: $($owner.Content)"

# 2. Входим в систему
$loginData = @{
    phone = "+70000000001"
    password = "Admin"
} | ConvertTo-Json

$login = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -Body $loginData -ContentType "application/json"
$loginResponse = $login.Content | ConvertFrom-Json
$token = $loginResponse.token

Write-Host "Токен получен: $token"

# 3. Создаем заголовки с токеном
$headers = @{
    "Authorization" = "Bearer $token"
}

# 4. Создаем объявление
$puppyData = @{
    name = "Рекс"
    breed = "Немецкая овчарка"
    age = 2
    gender = "male"
    color = "Черно-подпалый"
    price = 35000
    description = "Отличный щенок немецкой овчарки, приучен к командам"
} | ConvertTo-Json

$puppy = Invoke-WebRequest -Uri "http://localhost:5000/api/puppies" -Method POST -Body $puppyData -ContentType "application/json" -Headers $headers
Write-Host "Объявление создано: $($puppy.Content)"

# 5. Проверяем список щенков
$puppies = Invoke-WebRequest -Uri "http://localhost:5000/api/puppies" -Method GET
Write-Host "Список щенков: $($puppies.Content)"
```

## Примечания

1. **Токен JWT** - после входа в систему сохраните токен для использования в других запросах
2. **Content-Type** - для POST запросов всегда указывайте `application/json`
3. **Обработка ошибок** - проверяйте StatusCode в ответах
4. **Файлы** - для загрузки файлов используйте `multipart/form-data`

## Альтернативные инструменты

Если PowerShell неудобен, можно использовать:
- **Postman** - графический интерфейс для тестирования API
- **curl** (если установлен Git Bash или WSL)
- **Insomnia** - альтернатива Postman 