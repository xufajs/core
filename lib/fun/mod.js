const { curry2 } = require('./curry');
const { isFunction } = require('./is-function');
const { isObject } = require('./is-object');

const MOD_TAG = '@@tag/mod';

function modOp(a, b) {
  if (isObject(a)) {
    if (isFunction(a.constructor[MOD_TAG])) {
      return a.constructor[MOD_TAG](a, b);
    }
  }
  if (isObject(b)) {
    if (isFunction(b.constructor[MOD_TAG])) {
      return b.constructor[MOD_TAG](a, b);
    }
  }
  return Number(a) % Number(b);
}

function mod(...args) {
  let current = args[0];
  for (let i = 1; i < args.length; i += 1) {
    current = modOp(current, args[i]);
  }
  return current;
}

module.exports = {
  modOp,
  mod: curry2(mod),
  MOD_TAG,
};
