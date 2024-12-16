const NEGATE_TAG = '@@tag/negate';

function negate(x) {
  if (x && x.constructor && x.constructor[NEGATE_TAG]) {
    return x.constructor[NEGATE_TAG](x);
  }
  return -x;
}

module.exports = { negate, NEGATE_TAG };
