const { forEach } = require('./for-each');
const { isArrayLike } = require('./is-array-like');
const { isIterable } = require('./is-iterable');
const { isString } = require('./is-string');
const { isObject } = require('./is-object');
const { newArrayLike } = require('./new-array-like');

function bisect(arr, ...indexList) {
  const result = [];
  let index = indexList.shift();
  let current;
  forEach(arr, (item, i) => {
    if (i === index) {
      index = indexList.shift();
      current = undefined;
    }
    if (current === undefined) {
      current = [];
      result.push(current);
    }
    current.push(item);
  });
  return result;
}

function bisectSrc(x, ...indexList) {
  if (x == null) {
    return x;
  }
  if (isArrayLike(x) || isString(x)) {
    const result = [];
    let index = indexList.shift();
    let current = [];
    for (let i = 0; i < x.length; i += 1) {
      if (i === index) {
        result.push(isString(x) ? current.join('') : newArrayLike(x, current));
        index = indexList.shift();
        current = [];
      }
      current.push(x[i]);
      if (i === x.length - 1) {
        result.push(isString(x) ? current.join('') : newArrayLike(x, current));
      }
    }
    return result;
  }
  if (isIterable(x)) {
    const result = [];
    let index = indexList.shift();
    let current = [];
    let i = 0;
    do {
      if (i === index) {
        result.push(newArrayLike(x, current));
        index = indexList.shift();
        current = [];
      }
      i += 1;
    } while (!current.done);
    if (current.length) {
      result.push(newArrayLike(x, current));
    }
    return result;
  }
  if (isObject(x)) {
    const result = [];
    let index = indexList.shift();
    let current = {};
    result.push(current);
    const keys = Object.keys(x);
    for (let i = 0; i < keys.length; i += 1) {
      if (i === index) {
        result.push(current);
        index = indexList.shift();
        current = {};
      }
      current[keys[i]] = x[keys[i]];
    }
    return result;
  }
  return undefined;
}

module.exports = { bisect, bisectSrc };
