const { curry2 } = require('./curry');
const { isObject } = require('./is-object');
const { isFunction } = require('./is-function');

const DIV_TAG = '@@tag/div';

function divOp(a, b) {
  if (isObject(a) && isFunction(a.constructor[DIV_TAG])) {
    return a.constructor[DIV_TAG](a, b);
  }
  if (isObject(b) && isFunction(b.constructor[DIV_TAG])) {
    return b.constructor[DIV_TAG](a, b);
  }
  return Number(a) / Number(b);
}

function div(...args) {
  return args.reduce((acc, curr) => divOp(acc, curr));
}

module.exports = {
  divOp,
  div: curry2(div),
  DIV_TAG,
};
