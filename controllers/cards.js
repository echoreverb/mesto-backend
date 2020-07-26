const mongoose = require('mongoose');
const Card = require('../models/card');
const ValidationError = require('../libs/errors/validation-error');
const ForbiddenError = require('../libs/errors/forbidden-error');
const NotFoundError = require('../libs/errors/not-found-error');

// eslint-disable-next-line consistent-return
const createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const created = await Card.create({ name, link, owner });
    res.json({ data: created });
  } catch (e) {
    if (e.name === 'ValidationError') {
      return next(new ValidationError(e.message));
    }
    next(e);
  }
};

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({});
    res.json({ data: cards });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.json({ data: [] });
      return;
    }
    next(e);
  }
};

const deleteCard = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return next(new ValidationError('Некорректный cardId'));
  }
  try {
    const found = await Card.findById({ _id: req.params.cardId }).orFail();
    if (req.user._id !== found.owner.toString()) {
      return next(new ForbiddenError('Вы можете удалять только свои карточки'));
    }
    await Card.deleteOne({ _id: req.params.cardId });
    res.json({ message: 'Карточка удалена' });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Не найдена карточка'));
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const likeCard = async (req, res, next) => {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Не найдена карточка'));
    }
    if (e.name === 'ValidationError') {
      return next(new ValidationError(e.message));
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const dislikeCard = async (req, res, next) => {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError('Не найдена карточка'));
    }
    if (e.name === 'ValidationError') {
      return next(new ValidationError(e.message));
    }
    next(e);
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
