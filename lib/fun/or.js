const { curry2 } = require('./curry');
const { isFunction } = require('./is-function');
const { isObject } = require('./is-object');

const OR_TAG = '@@tag/or';

function orOp(a, b) {
  if (isObject(a) && isFunction(a.constructor[OR_TAG])) {
    return a.constructor[OR_TAG](a, b);
  }
  if (isObject(b) && isFunction(b.constructor[OR_TAG])) {
    return b.constructor[OR_TAG](a, b);
  }
  return a || b;
}

function or(...args) {
  let result = false;
  for (let i = 0; i < args.length; i += 1) {
    result = orOp(result, args[i]);
    if (result) {
      return true;
    }
  }
  return false;
}

function orFn(...fns) {
  return function andFnRet(...args) {
    let result = false;
    for (let i = 0; i < fns.length; i += 1) {
      const fn = fns[i];
      const value = isFunction(fn) ? fn(...args) : fn;
      result = orOp(result, value);
      if (value) {
        return true;
      }
    }
    return false;
  };
}

module.exports = {
  orOp,
  or: curry2(or),
  orFn: curry2(orFn),
  OR_TAG,
};
