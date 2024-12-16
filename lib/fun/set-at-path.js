const { curry3 } = require('./curry');
const { clone } = require('../core/clone');
const { setAtPathMut } = require('./set-at-path-mut');

function setAtPath(x, path, value) {
  const cloned = clone(x);
  return setAtPathMut(cloned, path, value);
}

module.exports = { setAtPath: curry3(setAtPath) };
