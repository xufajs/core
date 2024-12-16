const { curry2 } = require('./curry');
const { forEach } = require('./for-each');

function max(...args) {
  let result;
  let isFirst = true;
  forEach(args, (c) => {
    const n = Number(c);
    if (isFirst) {
      result = n;
      isFirst = false;
    } else if (n > result) {
      result = n;
    }
  });
  return result;
}

module.exports = { max: curry2(max) };
