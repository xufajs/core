const { isPlaceholder } = require('./placeholder');
const { solve, solveArgs } = require('./solve');

function curry2(fn) {
  return function f2(...args) {
    switch (args.length) {
      case 0:
        return f2;
      case 1:
        return isPlaceholder(args[0]) ? f2 : (b, ...cargs) => fn(args[0], b, ...cargs);
      case 2:
        if (isPlaceholder(args[0])) {
          return isPlaceholder(args[1]) ? f2 : (a, ...cargs) => fn(a, args[1], ...cargs);
        }
        return isPlaceholder(args[1]) ? (b, ...cargs) => fn(args[0], b, ...cargs) : fn(...args);
      default:
        return fn(...args);
    }
  };
}

function curry2s(fn) {
  return async function f2(...args) {
    switch (args.length) {
      case 0:
        return f2;
      case 1: {
        const v0 = await solve(args[0]);
        return isPlaceholder(v0)
          ? f2
          : async (b, ...cargs) => {
              const vargs = await solveArgs(cargs);
              return fn(v0, b, ...vargs);
            };
      }
      case 2: {
        const [v0, v1] = await Promise.all([solve(args[0]), solve(args[1])]);
        if (isPlaceholder(v0)) {
          return isPlaceholder(v1)
            ? f2
            : async (a, ...cargs) => {
                const [va, ...vargs] = await Promise.all([solve(a), ...solveArgs(cargs)]);
                return fn(va, v1, ...vargs);
              };
        }
        if (isPlaceholder(v1)) {
          return async (b, ...cargs) => {
            const [vb, ...vargs] = await Promise.all([solve(b), ...solveArgs(cargs)]);
            return fn(v0, vb, ...vargs);
          };
        }
        return fn(v0, v1);
      }
      default: {
        const vargs = await solveArgs(args);
        return fn(...vargs);
      }
    }
  };
}

function curry3(fn) {
  return function f3(...args) {
    switch (args.length) {
      case 0:
        return f3;
      case 1:
        return isPlaceholder(args[0]) ? f3 : curry2((b, c, ...cargs) => fn(args[0], b, c, ...cargs));
      case 2:
        if (isPlaceholder(args[0])) {
          return isPlaceholder(args[1]) ? f3 : curry2((a, c, ...cargs) => fn(a, args[1], c, ...cargs));
        }
        return isPlaceholder(args[1])
          ? curry2((b, c, ...cargs) => fn(args[0], b, c, ...cargs))
          : (c, ...cargs) => fn(args[0], args[1], c, ...cargs);
      default:
        if (isPlaceholder(args[0])) {
          if (isPlaceholder(args[1])) {
            return isPlaceholder(args[2]) ? f3 : curry2((a, b, ...cargs) => fn(a, b, args[2], ...cargs));
          }
          return isPlaceholder(args[2])
            ? curry2((a, c, ...cargs) => fn(a, args[1], c, ...cargs))
            : (a, ...cargs) => fn(a, args[1], args[2], ...cargs);
        }
        if (isPlaceholder(args[1])) {
          return isPlaceholder(args[2])
            ? curry2((b, c, ...cargs) => fn(args[0], b, c, ...cargs))
            : (b, ...cargs) => fn(args[0], b, args[2], ...cargs);
        }
        return isPlaceholder(args[2]) ? (c, ...cargs) => fn(args[0], args[1], c, ...cargs) : fn(...args);
    }
  };
}

function curry3s(fn) {
  return async function f3(...args) {
    switch (args.length) {
      case 0:
        return f3;
      case 1: {
        const v0 = await solve(args[0]);
        return isPlaceholder(v0) ? f3 : curry2s((b, c, ...cargs) => fn(v0, b, c, ...cargs));
      }
      case 2: {
        const [v0, v1] = await Promise.all([solve(args[0]), solve(args[1])]);
        if (isPlaceholder(v0)) {
          return isPlaceholder(v1) ? f3 : curry2s((a, c, ...cargs) => fn(a, v1, c, ...cargs));
        }
        return isPlaceholder(v1)
          ? curry2s((b, c, ...cargs) => fn(v0, b, c, ...cargs))
          : async (c, ...cargs) => {
              const [vc, ...vargs] = await Promise.all([solve(c), ...solveArgs(cargs)]);
              return fn(v0, v1, vc, ...vargs);
            };
      }
      default: {
        const [v0, v1, v2, ...vrest] = await Promise.all(args.map(solve));
        if (isPlaceholder(v0)) {
          if (isPlaceholder(v1)) {
            return isPlaceholder(v2) ? f3 : curry2s((a, b, ...cargs) => fn(a, b, v2, ...cargs));
          }
          return isPlaceholder(v2)
            ? curry2s((a, c, ...cargs) => fn(a, v1, c, ...cargs))
            : async (a, ...cargs) => {
                const [va, ...vargs] = await Promise.all([solve(a), ...solveArgs(cargs)]);
                return fn(va, v1, v2, ...vargs);
              };
        }
        if (isPlaceholder(v1)) {
          return isPlaceholder(v2)
            ? curry2s((b, c, ...cargs) => fn(v0, b, c, ...cargs))
            : async (b, ...cargs) => {
                const [vb, ...vargs] = await Promise.all([solve(b), ...solveArgs(cargs)]);
                return fn(v0, vb, v2, ...vargs);
              };
        }
        return isPlaceholder(v2)
          ? async (c, ...cargs) => {
              const [vc, ...vargs] = await Promise.all([solve(c), ...solveArgs(cargs)]);
              return fn(v0, v1, vc, ...vargs);
            }
          : fn(v0, v1, v2, ...vrest);
      }
    }
  };
}

function applyFn(fn) {
  return function applyFnRet(...args) {
    return fn.apply(this, args);
  };
}

function curryNfn(length, fn, received = []) {
  if (length === 1) {
    return fn;
  }
  if (length === 2) {
    return curry2(fn);
  }
  if (length === 3) {
    return curry3(fn);
  }
  return function curryNret(...args) {
    const combined = [];
    let argsIndex = 0;
    let left = length;
    let combinedIndex = 0;
    while (combinedIndex < received.length || argsIndex < args.length) {
      if (combinedIndex < received.length && (!isPlaceholder(received[combinedIndex]) || argsIndex >= args.length)) {
        combined[combinedIndex] = received[combinedIndex];
      } else {
        combined[combinedIndex] = args[argsIndex];
        argsIndex += 1;
      }
      if (!isPlaceholder(combined[combinedIndex])) {
        left -= 1;
      }
      combinedIndex += 1;
    }
    return left <= 0 ? fn.apply(this, combined) : applyFn(curryNfn(length, fn, combined));
  };
}

function applyFns(fn) {
  return async function applyFnRet(...args) {
    const vargs = await solveArgs(args);
    return fn.apply(this, vargs);
  };
}

function curryNfns(length, fn, received = []) {
  if (length === 1) {
    return fn;
  }
  if (length === 2) {
    return curry2s(fn);
  }
  if (length === 3) {
    return curry3s(fn);
  }
  return async function curryNrets(...args) {
    const combined = [];
    let argsIndex = 0;
    let left = length;
    let combinedIndex = 0;
    const vargs = await solveArgs(args);
    while (combinedIndex < received.length || argsIndex < vargs.length) {
      if (combinedIndex < received.length && (!isPlaceholder(received[combinedIndex]) || argsIndex >= vargs.length)) {
        combined[combinedIndex] = received[combinedIndex];
      } else {
        combined[combinedIndex] = vargs[argsIndex];
        argsIndex += 1;
      }
      if (!isPlaceholder(combined[combinedIndex])) {
        left -= 1;
      }
      combinedIndex += 1;
    }
    return left <= 0 ? fn.apply(this, combined) : applyFns(curryNfns(length, fn, combined));
  };
}

const curryN = curry2(curryNfn);

const curryNs = curry2(curryNfns);

function curry(fn) {
  return curryN(fn.length, fn);
}

function currys(fn) {
  return curryNs(fn.length, fn);
}

module.exports = { curry2, curry2s, curry3, curry3s, curryN, curryNs, curry, currys };
