const { curry2 } = require('./curry');
const { isFunction } = require('./is-function');
const { isObject } = require('./is-object');

const MULT_TAG = '@@tag/mult';

function multOp(a, b) {
  if (isObject(a)) {
    if (isFunction(a.constructor[MULT_TAG])) {
      return a.constructor[MULT_TAG](a, b);
    }
  }
  if (isObject(b)) {
    if (isFunction(b.constructor[MULT_TAG])) {
      return b.constructor[MULT_TAG](a, b);
    }
  }
  return Number(a) * Number(b);
}

function mult(...args) {
  let current = args[0];
  for (let i = 1; i < args.length; i += 1) {
    current = multOp(current, args[i]);
  }
  return current;
}

module.exports = {
  multOp,
  mult: curry2(mult),
  MULT_TAG,
};
