const { curry2 } = require('./curry');

function gt(a, b) {
  return a > b;
}

module.exports = {
  gt: curry2(gt),
};
