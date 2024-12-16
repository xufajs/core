const { ioc } = require('./container');
const { isFunction } = require('../fun/is-function');

const getRef = (ref) => `@@ref:${ref}`;

function serializeValue(value, refs, objList) {
  if (value === null || typeof value !== 'object') {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => serializeValue(item, refs, objList));
  }
  if (value instanceof Date) {
    return { className: 'Date', value: value.toISOString() };
  }
  if (value instanceof RegExp) {
    return { className: 'RegExp', value: value.toString() };
  }
  if (value instanceof Map || value instanceof Set) {
    return {
      className: value.constructor.name,
      value: serializeValue(Array.from(value), refs, objList),
    };
  }
  if (ArrayBuffer.isView(value)) {
    return {
      className: 'ArrayBufferView',
      subClassName: value.constructor.name,
      value: serializeValue(Array.from(value), refs, objList),
    };
  }
  let ref = refs.get(value);
  if (ref !== undefined) {
    return getRef(ref);
  }
  const serializer = ioc.get(`serialize${value.constructor.name}`);
  if (serializer) {
    return serializer(value, refs, objList);
  }
  if (isFunction(value.serialize)) {
    return value.serialize(value, refs, objList);
  }
  if (isFunction(value.constructor.serialize)) {
    return value.constructor.serialize(value, refs, objList);
  }
  const result = {
    className: value.constructor.name,
    value: {},
  };
  ref = objList.length;
  refs.set(value, ref);
  objList.push(result);
  Object.entries(value).forEach(([key, val]) => {
    result.value[key] = serializeValue(val, refs, objList);
  });

  return getRef(ref);
}

function serialize(obj) {
  const refs = new Map();
  const objList = [];
  const result = serializeValue(obj, refs, objList);
  return { value: result, refs: objList };
}

module.exports = {
  serialize,
};
