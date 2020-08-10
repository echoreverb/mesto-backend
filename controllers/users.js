const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');
const ValidationError = require('../libs/errors/validation-error');
const NotFoundError = require('../libs/errors/not-found-error');
const { errormessage } = require('../libs/custommessages');
const NotUniqueError = require('../libs/errors/not-unique-error');

const { NODE_ENV, JWT_SECRET } = process.env;

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
    if (e.code === 11000) {
      return next(new NotUniqueError(errormessage.notUniqueEmail));
    }
    next(e);
  }
};

const getUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).orFail();
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
    return next(new ValidationError(errormessage.incorrectUserId));
  }
  try {
    const user = await User.findById(req.params.userId).orFail();
    res.json({ data: user });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError(errormessage.userNotFound));
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
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const login = async (req, res, next) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id },
      NODE_ENV === 'production' ? JWT_SECRET : 'secret-key',
      { expiresIn: '7d' });
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
