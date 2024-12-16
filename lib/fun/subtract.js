const { curry2 } = require('./curry');
const { isFunction } = require('./is-function');
const { isObject } = require('./is-object');
const { add } = require('./add');
const { negate, NEGATE_TAG } = require('./negate');

const SUBTRACT_TAG = '@@tag/subtract';

function subtractOp(a, b) {
  if (isObject(a)) {
    if (isFunction(a.constructor[SUBTRACT_TAG])) {
      return a.constructor[SUBTRACT_TAG](a, b);
    }
  }
  if (isObject(b)) {
    if (isFunction(b.constructor[SUBTRACT_TAG])) {
      return b.constructor[SUBTRACT_TAG](a, b);
    }
    if (isFunction(b.constructor[NEGATE_TAG])) {
      return add(a, negate(b));
    }
  }
  if (typeof a === typeof b && !(a instanceof Date)) {
    return a - b;
  }
  return Number(a) - Number(b);
}

function subtract(...args) {
  let current = args[0];
  for (let i = 1; i < args.length; i += 1) {
    current = subtractOp(current, args[i]);
  }
  return current;
}

module.exports = {
  subtractOp,
  subtract: curry2(subtract),
  SUBTRACT_TAG,
};
