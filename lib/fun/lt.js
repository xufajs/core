const { curry2 } = require('./curry');

function lt(a, b) {
  return a < b;
}

module.exports = {
  lt: curry2(lt),
};
