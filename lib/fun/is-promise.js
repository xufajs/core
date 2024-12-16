const { isFunction } = require('./is-function');

function isPromise(p) {
  return p && isFunction(p.then);
}

module.exports = { isPromise };
