const { add } = require('./add');

function inc(n) {
  return add(n, 1);
}

module.exports = { inc };
