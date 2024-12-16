function isFloat(x) {
  return typeof x === 'number' && x % 1 !== 0;
}

module.exports = { isFloat };
