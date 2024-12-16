const { curry2 } = require('./curry');
const { isFunction } = require('./is-function');
const { isObject } = require('./is-object');

const AND_TAG = '@@tag/and';

function andOp(a, b) {
  if (isObject(a) && isFunction(a.constructor[AND_TAG])) {
    return a.constructor[AND_TAG](a, b);
  }
  if (isObject(b) && isFunction(b.constructor[AND_TAG])) {
    return b.constructor[AND_TAG](a, b);
  }
  return Boolean(a) && Boolean(b);
}

function and(...args) {
  return args.every((arg) => andOp(true, arg));
}

function andFn(...fns) {
  return function andFnRet(...args) {
    return fns.every((fn) => {
      const value = isFunction(fn) ? fn(...args) : fn;
      return andOp(true, value);
    });
  };
}

module.exports = {
  andOp,
  and: curry2(and),
  andFn: curry2(andFn),
  AND_TAG,
};
