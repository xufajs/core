const { forEach } = require('./for-each');

function arrArg(arr, initValue, fn) {
  let id = -1;
  let val = initValue;
  forEach(arr, (item, i) => {
    if (fn(item, val, i, arr)) {
      val = item;
      id = i;
    }
  });
  return id;
}

function argMin(arr, min = Infinity, fn = (a, b) => a < b) {
  return arrArg(arr, min, fn);
}

function argMax(arr, max = -Infinity, fn = (a, b) => a > b) {
  return arrArg(arr, max, fn);
}

module.exports = { arrArg, argMin, argMax };
