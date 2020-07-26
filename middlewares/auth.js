const jwt = require('jsonwebtoken');
const AuthError = require('../libs/errors/auth-error');

const auth = async (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next(new AuthError('Необходима авторизация'));
  }
  const token = authorization.replace('Bearer ', '');
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET || 'secret-key');
  } catch (e) {
    return next(new AuthError('Необходима авторизация'));
  }
  req.user = payload;
  return next();
};

module.exports = auth;
