const NOT_TAG = '@@tag/not';

function not(x) {
  if (x && x.constructor && x.constructor[NOT_TAG]) {
    return x.constructor[NOT_TAG](x);
  }
  return !x;
}

module.exports = {
  not,
  NOT_TAG,
};
