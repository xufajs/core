const { curry2 } = require('./curry');
const { isArrayLike } = require('./is-array-like');
const { isString } = require('./is-string');
const { isObject } = require('./is-object');
const { isIterable } = require('./is-iterable');
const { newArrayLike } = require('./new-array-like');

function filterSrc(x, fn) {
  if (x == null) {
    return x;
  }

  if (isArrayLike(x) || isString(x)) {
    const result = [];
    for (let i = 0; i < x.length; i += 1) {
      if (fn(x[i], i, x)) {
        result.push(x[i]);
      }
    }
    return isString(x) ? result.join('') : newArrayLike(x, result);
  }

  if (isIterable(x)) {
    const result = [];
    let index = 0;
    const iterator = x[Symbol.iterator]();
    let current;
    do {
      current = iterator.next();
      if (!current.done && fn(current.value, current.index || index, x)) {
        result.push(current.value);
      }
      index += 1;
    } while (!current.done);
    return newArrayLike(x, result);
  }

  if (isObject(x)) {
    return Object.keys(x).reduce((result, key) => {
      if (fn(x[key], key, x)) {
        // eslint-disable-next-line no-param-reassign
        result[key] = x[key];
      }
      return result;
    }, {});
  }

  return fn(x, 0, x) ? x : undefined;
}

module.exports = { filterSrc: curry2(filterSrc) };
