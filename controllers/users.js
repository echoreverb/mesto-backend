const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../libs/errors/validation-error');
const NotFoundError = require('../libs/errors/not-found-error');

// eslint-disable-next-line consistent-return
const createUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  try {
    const hash = await bcrypt.hash(password, 10);
    const created = await User.create({
      name, about, avatar, email, password: hash,
    });
    res.json({
      data:
      {
        name: created.name,
        about: created.about,
        avatar: created.avatar,
        email: created.email,
      },
    });
  } catch (e) {
    if ((!password || password.length < 8) && e.name === 'ValidationError') {
      e.message += ', password: Необходимо задать пароль длиной не менее восьми символов!';
      return next(new ValidationError(e.message));
    }
    if (e.name === 'ValidationError') {
      return next(new ValidationError(e.message));
    }
    if (!password || password.length < 8) {
      return next(new ValidationError('user validation failed: password: Необходимо задать пароль длиной не менее восьми символов!'));
    }
    next(e);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({});
    res.json({ data: users });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.json({ data: [] });
      return;
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const getUserById = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    return next(new ValidationError('Некорректный userId'));
  }
  try {
    const user = await User.findById(req.params.userId);
    res.json({ data: user });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Не найден пользователь с таким userId'));
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const updateUser = async (req, res, next) => {
  const { name, about } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(req.user._id,
      { name, about },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return next(new ValidationError(e.message));
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const updateAvatar = async (req, res, next) => {
  const { avatar } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(req.user._id,
      { avatar },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return next(new ValidationError(e.message));
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: (7 * 24 * 3600000) });
    res.status(201).send({ message: `Привет, ${user.name}!` });
  } catch (e) {
    next(e);
  }
};

module.exports = {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  updateAvatar,
  login,
};
