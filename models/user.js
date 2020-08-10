const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const AuthError = require('../libs/errors/auth-error');
const { errormessage } = require('../libs/custommessages');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  about: {
    type: String,
    required: true,
  },
  avatar: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    select: false,
    required: true,
  },
});

userSchema.statics.findUserByCredentials = async function findUserByCredentials(email, password) {
  const user = await this.findOne({ email }).select('+password');
  if (!user) {
    return Promise.reject(new AuthError(errormessage.wrongCredentials));
  }
  const matched = await bcrypt.compare(password, user.password);
  if (!matched) {
    return Promise.reject(new AuthError(errormessage.wrongCredentials));
  }
  return user;
};

module.exports = mongoose.model('user', userSchema);
