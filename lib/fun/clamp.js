const { curry3 } = require('./curry');

function clamp(min, max, value) {
  if (min > max) {
    throw new Error('Max should be greater than max in clamp(min, max, value)');
  }
  if (value < min) {
    return min;
  }
  return value > max ? max : value;
}

module.exports = { clamp: curry3(clamp) };
