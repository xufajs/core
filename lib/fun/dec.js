const { add } = require('./add');

function dec(n) {
  return add(n, -1);
}

module.exports = { dec };
