const { curry2 } = require('./curry');

function lte(a, b) {
  return a <= b;
}

module.exports = {
  lte: curry2(lte),
};
