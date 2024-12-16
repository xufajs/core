function isASCII(x) {
  // eslint-disable-next-line no-control-regex
  return /^[\x00-\x7f]+$/.test(x);
}

function isPrintableASCII(x) {
  return /^[\x20-\x7e]+$/.test(x);
}

module.exports = { isASCII, isPrintableASCII };
