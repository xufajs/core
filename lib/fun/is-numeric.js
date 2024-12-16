function isNumericInt(x) {
  return /^[-+]?\d+$/.test(x);
}

function isNumeric(x) {
  return /^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(x);
}

module.exports = { isNumericInt, isNumeric };
