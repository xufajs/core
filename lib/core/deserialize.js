const { ioc } = require('./container');

function deserializeValue(value, refs) {
  if (value === null || value === undefined) {
    return value;
  }
  if (typeof value === 'string' && value.startsWith('@@ref:')) {
    const ref = parseInt(value.substring(6), 10);
    return refs[ref];
  }
  if (Array.isArray(value)) {
    return value.map((item) => deserializeValue(item, refs));
  }
  if (typeof value === 'object') {
    switch (value.className) {
      case 'Object':
        return Object.fromEntries(Object.entries(value).map(([key, val]) => [key, deserializeValue(val, refs)]));
      case 'Date':
        return new Date(value.value);
      case 'RegExp':
        return new RegExp(value.value);
      case 'Map':
      case 'Set':
      case 'ArrayBufferView':
        // eslint-disable-next-line no-case-declarations
        const arr = value.value.map((item) => deserializeValue(item, refs));
        if (value.className === 'ArrayBufferView') {
          const TypedArray = global[value.subClassName];
          return new TypedArray(arr);
        }
        return value.className === 'Map' ? new Map(arr) : new Set(arr);
      default:
        return value;
    }
  }
  return value;
}

function deserialize(input) {
  if (!input.refs) {
    return input;
  }
  const objs = input.refs.map((ref) => {
    const deserializer = ioc.get(`deserialize${ref.className}`);
    return deserializer ? deserializer(ref.value) : ioc.getInstance(ref.className, undefined) || {};
  });
  objs.forEach((obj, index) => {
    const refValue = input.refs[index].value;
    Object.entries(refValue).forEach(([key, value]) => {
      // eslint-disable-next-line no-param-reassign
      obj[key] = deserializeValue(value, objs);
    });
  });
  if (Array.isArray(input.value)) {
    return input.value.map((item) => deserializeValue(item, objs));
  }
  return typeof input.value === 'string' && input.value.startsWith('@@ref:')
    ? objs[parseInt(input.value.substring(6), 10)]
    : input.value;
}

module.exports = {
  deserialize,
};
