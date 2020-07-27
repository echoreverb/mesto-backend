const express = require('express');
const mongoose = require('mongoose');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const { celebrate, Joi, isCelebrate } = require('celebrate');
const cards = require('./routes/cards');
const users = require('./routes/users');
const auth = require('./middlewares/auth');
const { login, createUser } = require('./controllers/users');
const { errormessage } = require('./libs/custommessages');

const { PORT = 3000 } = process.env;

const app = express();

app.use(helmet());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/signin', celebrate({
  body: Joi.object().keys({
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), login);

app.post('/signup', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
    avatar: Joi.string().required().min(2).max(30),
    email: Joi.string().required().email(),
    password: Joi.string().required().min(8),
  }),
}), createUser);

app.use(auth);
app.use('/users', users);
app.use('/cards', cards);

// eslint-disable-next-line consistent-return
app.use((err, req, res, next) => {
  if (!isCelebrate(err)) {
    return next(err);
  }
  const { statusCode = 400, message } = err;
  res.status(statusCode).send({ message });
});

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  const { statusCode = 500, message } = err;
  res.status(statusCode).send({
    message: statusCode === 500
      ? errormessage.internalServerErr
      : message,
  });
});

app.use((req, res) => {
  res.status(404).send({ message: errormessage.pageNotFound });
});

async function start() {
  try {
    await mongoose.connect('mongodb://localhost:27017/mestodb', {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    });
    app.listen(PORT, () => {
      /* eslint no-console: ["error", { allow: ["log", "error"] }] */
      console.log(`Server is running on PORT: ${PORT}`);
    });
  } catch (e) {
    console.error(e);
  }
}

start();
