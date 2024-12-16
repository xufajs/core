const { ioc } = require('./container');
const { isFunction } = require('../fun/is-function');

const cloneBuffer = (cur) =>
  cur instanceof Buffer ? Buffer.from(cur) : new cur.constructor(cur.buffer.slice(), cur.byteOffset, cur.length);

function cloneRegExp(obj) {
  const flags =
    (obj.global ? 'g' : '') +
    (obj.ignoreCase ? 'i' : '') +
    (obj.multiline ? 'm' : '') +
    (obj.sticky ? 'y' : '') +
    (obj.unicode ? 'u' : '');
  return new RegExp(obj.source, flags);
}

function clone(obj, refs = new Map()) {
  if (typeof obj !== 'object' || obj === null) {
    return obj;
  }
  if (obj instanceof Date) {
    return new Date(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map((x) => clone(x, refs));
  }
  if (obj instanceof Map) {
    return new Map(clone(Array.from(obj), refs));
  }
  if (obj instanceof Set) {
    return new Set(clone(Array.from(obj), refs));
  }
  if (obj instanceof RegExp) {
    return cloneRegExp(obj);
  }
  if (ArrayBuffer.isView(obj)) {
    return cloneBuffer(obj);
  }
  const ref = refs.get(obj);
  if (ref !== undefined) {
    return ref;
  }
  const cloner = ioc.get(`clone${obj.constructor.name}`);
  if (cloner) {
    return cloner(obj, refs);
  }
  if (isFunction(obj.clone)) {
    return obj.clone(obj, refs);
  }
  if (isFunction(obj.constructor.clone)) {
    return obj.constructor.clone(obj, refs);
  }
  const result = ioc.getInstance(obj.constructor, undefined) || {};
  refs.set(obj, result);
  // eslint-disable-next-line
  for (const key in obj) {
    if (Object.hasOwnProperty.call(obj, key)) {
      result[key] = clone(obj[key], refs);
    }
  }
  return result;
}

module.exports = { clone, cloneBuffer, cloneRegExp };
