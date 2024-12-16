function isPrimitive(x) {
  return ['string', 'number', 'boolean'].includes(typeof x);
}

module.exports = { isPrimitive };
