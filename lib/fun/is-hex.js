function isHex(x) {
  return /^[a-f0-9]+$/i.test(x);
}

module.exports = { isHex };
