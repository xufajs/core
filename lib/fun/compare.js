const { curry2 } = require('./curry');
const { isNil } = require('./is-nil');
const { isNaN } = require('./is-nan');

function compare(a, b) {
  if (a === b) {
    return 0;
  }
  if (isNil(a)) {
    return isNil(b) ? 0 : -1;
  }
  if (isNil(b)) {
    return isNil(a) ? 0 : 1;
  }
  if (isNaN(a)) {
    return isNaN(b) ? 0 : -1;
  }
  if (isNaN(b)) {
    return isNaN(a) ? 0 : 1;
  }
  if (a.compare) {
    return a.compare(b);
  }
  if (b.compare) {
    return -b.compare(a);
  }
  if (a?.constructor?.compare) {
    return a.constructor.compare(a, b);
  }
  if (b?.constructor?.compare) {
    return b.constructor.compare(a, b);
  }
  // eslint-disable-next-line no-nested-ternary
  return a < b ? -1 : a > b ? 1 : 0;
}

module.exports = { compare: curry2(compare) };
