const { has } = require('./has');
const { isArray } = require('./is-array');

function isArrayLike(x) {
  if (isArray(x)) {
    return true;
  }
  if (!x || typeof x !== 'object') {
    return false;
  }
  if (x.length === 0) {
    return true;
  }
  return x.length > 0 && has(x, 0) && has(x, x.length - 1);
}

module.exports = { isArrayLike };
