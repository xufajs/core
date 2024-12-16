function isNil(x) {
  return x === undefined || x === null;
}

module.exports = { isNil, isUndefinedOrNull: isNil };
