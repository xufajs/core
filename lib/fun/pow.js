const { curry2 } = require('./curry');
const { isFunction } = require('./is-function');
const { isObject } = require('./is-object');

const POW_TAG = '@@tag/pow';

function powOp(a, b) {
  if (isObject(a)) {
    if (isFunction(a.constructor[POW_TAG])) {
      return a.constructor[POW_TAG](a, b);
    }
  }
  if (isObject(b)) {
    if (isFunction(b.constructor[POW_TAG])) {
      return b.constructor[POW_TAG](a, b);
    }
  }
  return Number(a) ** Number(b);
}

function pow(a, b) {
  return powOp(a, b);
}

module.exports = {
  powOp,
  pow: curry2(pow),
  POW_TAG,
};
