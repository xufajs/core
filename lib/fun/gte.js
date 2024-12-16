const { curry2 } = require('./curry');

function gte(a, b) {
  return a >= b;
}

module.exports = {
  gte: curry2(gte),
};
