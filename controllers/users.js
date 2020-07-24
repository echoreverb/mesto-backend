const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const createUser = async (req, res) => {
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
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const getUsers = async (req, res) => {
  try {
    const users = await User.find({}).orFail();
    res.json({ data: users });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.json({ data: [] });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const getUserById = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
    res.status(400).send({ message: 'Некорректный userId' });
    return;
  }
  try {
    const user = await User.findById(req.params.userId).orFail();
    res.json({ data: user });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.status(404).send({ message: 'Не найден пользователь с таким userId' });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const updateUser = async (req, res) => {
  const { name, about } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(req.user._id,
      { name, about },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const updateAvatar = async (req, res) => {
  const { avatar } = req.body;
  try {
    const updated = await User.findByIdAndUpdate(req.user._id,
      { avatar },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findUserByCredentials(email, password);
    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET || 'secret-key', { expiresIn: '7d' });
    res.cookie('jwt', token, { httpOnly: true, maxAge: (7 * 24 * 3600000) });
    res.status(201).send({ message: `Привет, ${user.name}!` });
  } catch (e) {
    if (e.message === 'Неправильные почта или пароль') {
      res.status(401).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.message });
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
