const mongoose = require('mongoose');
const validatorCheck = require('validator');
const validatorMessage = require('../libs/validatormessage');

const cardSchema = new mongoose.Schema({
  name: {
    type: String,
    required: validatorMessage.required,
    minlength: validatorMessage.minLength(2),
    maxlength: validatorMessage.maxLength(30),
  },
  link: {
    type: String,
    required: validatorMessage.required,
    validate: {
      validator(v) {
        return validatorCheck.isURL(v);
      },
      message: (props) => `${props.value} - вместо этого должна быть ссылка на изображение!`,
    },
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: validatorMessage.required,
  },
  likes: {
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'user' }],
    default: [],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('card', cardSchema);
