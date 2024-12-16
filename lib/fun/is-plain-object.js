function isPlainObject(x) {
  if (x !== null && Object.prototype.toString.call(x) === '[object Object]') {
    const proto = Object.getPrototypeOf(x);
    return proto === null || Object.getPrototypeOf(proto) === null;
  }
  return false;
}

module.exports = { isPlainObject };
