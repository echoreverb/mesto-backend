const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const validatorCheck = require('validator');
const validatorMessage = require('../libs/validatormessage');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: validatorMessage.required,
    minlength: validatorMessage.minLength(2),
    maxlength: validatorMessage.maxLength(30),
  },
  about: {
    type: String,
    required: validatorMessage.required,
    minlength: validatorMessage.minLength(2),
    maxlength: validatorMessage.maxLength(30),
  },
  avatar: {
    type: String,
    required: validatorMessage.required,
    validate: {
      validator(v) {
        return validatorCheck.isURL(v);
      },
      message: (props) => `${props.value} - вместо этого должна быть ссылка на изображение!`,
    },
  },
  email: {
    type: String,
    unique: true,
    required: validatorMessage.required,
    validate: {
      validator(v) {
        return validatorCheck.isEmail(v);
      },
      message: (props) => `${props.value} - вместо этого должен быть корректный email`,
    },
  },
  password: {
    type: String,
    select: false,
    required: validatorMessage.required,
    minlength: validatorMessage.minLength(8),
  },
});

userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) {
    return Promise.reject(new Error('Неправильные почта или пароль'));
  }
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return Promise.reject(new Error('Неправильные почта или пароль'));
  }
  return user;
};

module.exports = mongoose.model('user', userSchema);
