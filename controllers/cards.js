const mongoose = require('mongoose');
const Card = require('../models/card');
const ValidationError = require('../libs/errors/validation-error');
const ForbiddenError = require('../libs/errors/forbidden-error');
const NotFoundError = require('../libs/errors/not-found-error');
const { errormessage } = require('../libs/custommessages');

// eslint-disable-next-line consistent-return
const createCard = async (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const created = await Card.create({ name, link, owner });
    res.json({ data: created });
  } catch (e) {
    next(e);
  }
};

const getCards = async (req, res, next) => {
  try {
    const cards = await Card.find({}).orFail();
    res.json({ data: cards });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.json({ data: [] });
      return;
    }
    next(e);
  }
};

// eslint-disable-next-line consistent-return
const deleteCard = async (req, res, next) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    return next(new ValidationError(errormessage.incorrectCardId));
  }
  try {
    const found = await Card.findById({ _id: req.params.cardId }).orFail();
    if (req.user._id !== found.owner.toString()) {
      return next(new ForbiddenError(errormessage.forbiddenDeleteCard));
    }
    await Card.deleteOne({ _id: req.params.cardId });
    res.json({ message: 'Карточка удалена' });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      return next(new NotFoundError(errormessage.cardNotFound));
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
      return next(new NotFoundError(errormessage.cardNotFound));
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
      return next(new NotFoundError(errormessage.cardNotFound));
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
