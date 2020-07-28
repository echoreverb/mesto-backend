# Проектная #15. Бэкенд проекта Место

В этой работе происходит настройка удалённого сервера и размещение на нём бэкенд-части проекта Место.

## REST API Место

- POST https://mestoproject.gq/signup - создаёт профиль пользователя { name, about, avatar, email, password }
- POST https://mestoproject.gq/signin - авторизирует пользователя { email, password }

- GET https://mestoproject.gq/users — возвращает всех пользователей 
- GET https://mestoproject.gq/users/:userId - возвращает пользователя по _id

- PATCH https://mestoproject.gq/users/me — обновляет профиль { name, about }
- PATCH https://mestoproject.gq/users/me/avatar — обновляет аватар { avatar }
- PUT https://mestoproject.gq/cards/:cardId/likes — поставить лайк карточке
- DELETE https://mestoproject.gq/cards/:cardId/likes — убрать лайк с карточки

- GET https://mestoproject.gq/cards — возвращает все карточки
- POST https://mestoproject.gq/cards — создаёт карточку { name, link }
- DELETE https://mestoproject.gq/cards/:cardId — удаляет карточку по идентификатору


## Ссылки

- деплой: https://mestoproject.gq
- исходный код: https://github.com/echoreverb/mesto-backend

## Установка

- установка модулей npm

```shell
$ npm install
```

- запуск сервера на `localhost:3000`

```shell
$ npm run start
```

- запуск сервера на `localhost:3000` c хот-релоудом

```shell
$ npm run dev
```


## Используемые инструменты и сервисы

- стек: [Node.js](https://nodejs.org), [Express](https://expressjs.com), [MongoDB](https://www.mongodb.com), [Mongoose](https://mongoosejs.com)
- безопасность: [jwt](https://www.npmjs.com/package/jsonwebtoken), [bcrypt](https://www.npmjs.com/package/bcrypt), [helmet](https://helmetjs.github.io)
- валидация данных: [Joi](https://hapi.dev/module/joi/)+[celebrate](https://github.com/arb/celebrate)
- логгирование: [Winston](https://www.npmjs.com/package/winston)
- размещение: [Яндекс.Облако](https://cloud.yandex.ru/), [Freenom](https://www.freenom.com), [Certbot](https://certbot.eff.org/)