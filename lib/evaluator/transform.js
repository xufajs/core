const { evaluate } = require('./evaluator');
const { isObject } = require('../fun/is-object');
const { clone } = require('../core/clone');
const { pipe } = require('../fun/pipe');
const { setAtPathMut } = require('../fun/set-at-path-mut');
const { getAtPath } = require('../fun/get-at-path');

const applyField = '__apply__';

function transformObj(input, src, context = {}) {
  if (Array.isArray(input)) {
    input.forEach((item, i) => {
      // eslint-disable-next-line no-param-reassign
      input[i] = transformObj(item, src, context);
    });
    return input;
  }
  if (isObject(input)) {
    const keys = Object.keys(input);
    keys.forEach((key) => {
      // eslint-disable-next-line no-param-reassign
      input[key] = transformObj(input[key], src, context);
    });
    return input;
  }
  if (typeof input === 'string') {
    if (input.startsWith('@@')) {
      return input.slice(1);
    }
    if (input.startsWith('@')) {
      return evaluate(input.slice(1), {
        ...src,
        ...context,
        $: { ...src },
      });
    }
  }
  return input;
}

function transform(obj, transformation, context) {
  let result = transformObj(clone(transformation), obj, context);
  const applyProperty = result[applyField];
  if (applyProperty) {
    for (let i = 0; i < applyProperty.length; i += 1) {
      const fns = applyProperty[i].pipe.map((name) => context[name]).filter((x) => x);
      if (fns.length) {
        const { paths } = applyProperty[i];
        if (!paths) {
          result = pipe(...fns)(result);
        } else {
          for (let j = 0; j < paths.length; j += 1) {
            setAtPathMut(result, paths[j], pipe(...fns)(getAtPath(result, paths[j])));
          }
        }
      }
    }
    delete result[applyField];
  }
  return result;
}

module.exports = { transform };
