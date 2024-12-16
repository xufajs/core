const { isFunction } = require('./is-function');

function solve(param) {
  return isFunction(param) ? param() : param;
}

async function solveArgs(args) {
  const result = [];
  for (let i = 0; i < args.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const solved = await solve(args[i]);
    result.push(solved);
  }
  return result;
}

function solvify(fn) {
  return async function solvified(...args) {
    const solvedArgs = await solveArgs(args);
    return fn(...solvedArgs);
  };
}

module.exports = { solve, solveArgs, solvify };
