const required = [true, 'Это обязательное поле!'];
const minLength = (minLengthInput) => [minLengthInput, `Минимальное количество символов - ${minLengthInput}`];
const maxLength = (maxLengthInput) => [maxLengthInput, `Максимальное количество символов - ${maxLengthInput}`];

module.exports = {
  required,
  minLength,
  maxLength,
};
