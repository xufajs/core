const { curry2 } = require('./curry');

function has(obj, prop) {
  return Object.prototype.hasOwnProperty.call(obj, prop);
}

module.exports = { has: curry2(has) };
