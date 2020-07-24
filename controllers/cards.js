const mongoose = require('mongoose');
const Card = require('../models/card');

const createCard = async (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  try {
    const created = await Card.create({ name, link, owner });
    res.json({ data: created });
  } catch (e) {
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const getCards = async (req, res) => {
  try {
    const cards = await Card.find({}).orFail();
    res.json({ data: cards });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.json({ data: [] });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const deleteCard = async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.cardId)) {
    res.status(400).send({ message: 'Некорректный cardId' });
    return;
  }
  try {
    const found = await Card.findById({ _id: req.params.cardId }).orFail();
    if (req.user._id !== found.owner.toString()) {
      res.status(403).send({ message: 'Вы можете удалять только свои карточки' });
      return;
    }
    await Card.deleteOne({ _id: req.params.cardId }).orFail();
    res.json({ message: 'Карточка удалена' });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.status(404).send({ message: 'Не найдена карточка' });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const likeCard = async (req, res) => {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.cardId,
      { $addToSet: { likes: req.user._id } },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.status(404).send({ message: 'Не найдена карточка' });
      return;
    }
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.message });
  }
};

const dislikeCard = async (req, res) => {
  try {
    const updated = await Card.findByIdAndUpdate(req.params.cardId,
      { $pull: { likes: req.user._id } },
      { new: true, runValidators: true })
      .orFail();
    res.json({ data: updated });
  } catch (e) {
    if (e.name === 'DocumentNotFoundError') {
      res.status(404).send({ message: 'Не найдена карточка' });
      return;
    }
    if (e.name === 'ValidationError') {
      res.status(400).send({ message: e.message });
      return;
    }
    res.status(500).send({ message: e.name });
  }
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
