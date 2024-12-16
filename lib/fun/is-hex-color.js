function isHexColor(x) {
  return typeof x === 'string' && /^#([a-f0-9]{3}|[a-f0-9]{4}(?:[a-f0-9]{2}){0,2})$/i.test(x);
}

module.exports = { isHexColor };
