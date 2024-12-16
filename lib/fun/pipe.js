const { identity } = require('./identity');
const { isFunction } = require('./is-function');

function pipe(...fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (!isFunction(fns[0])) {
    return pipe(...fns.slice(1))(fns[0]);
  }
  return function pipefn(...args) {
    const value = fns[0](...args);
    return fns.slice(1).reduce((p, fn) => fn(p), value);
  };
}

function compose(...fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (!isFunction(fns[fns.length - 1])) {
    return compose(...fns.slice(0, -1))(fns[fns.length - 1]);
  }
  return function pipefn(...args) {
    const value = fns[fns.length - 1](...args);
    return fns.slice(-1).reduceRight((p, fn) => fn(p), value);
  };
}

function pipeAsync(...fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (!isFunction(fns[0])) {
    return pipeAsync(...fns.slice(1))(fns[0]);
  }
  return async function pipeAsyncFn(...args) {
    const value = await fns[0](...args);
    return fns.slice(1).reduce(async (p, fn) => fn(await p), value);
  };
}

function composeAsync(...fns) {
  if (fns.length === 0) {
    return identity;
  }
  if (!isFunction(fns[fns.length - 1])) {
    return composeAsync(...fns.slice(0, -1))(fns[fns.length - 1]);
  }
  return async function pipefn(...args) {
    const value = await fns[fns.length - 1](...args);
    return fns.slice(-1).reduceRight(async (p, fn) => fn(await p), value);
  };
}

module.exports = { pipe, pipeAsync, compose, composeAsync };
