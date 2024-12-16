const { forEach } = require('./for-each');
const { isString } = require('./is-string');
const { isObject } = require('./is-object');
const { isArrayLike } = require('./is-array-like');

function boolDict(x) {
  if (isString(x)) {
    return { [x]: true };
  }
  const result = {};
  if (isObject(x) && !isArrayLike(x)) {
    forEach(x, (_, key) => {
      result[key] = true;
    });
  } else {
    forEach(x, (value) => {
      result[value] = true;
    });
  }
  return result;
}

module.exports = { boolDict };
