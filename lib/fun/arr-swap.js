function arrSwap(arr, x, y) {
  const t = arr[x];
  // eslint-disable-next-line no-param-reassign
  arr[x] = arr[y];
  // eslint-disable-next-line no-param-reassign
  arr[y] = t;
  return arr;
}

function arrMultiSwap(arrs, x, y) {
  arrs.forEach((arr) => arrSwap(arr, x, y));
  return arrs;
}

module.exports = { arrSwap, arrMultiSwap };
