const LIMIT_REPLACE_NODE = '[...]';
const CIRCULAR_REPLACE_NODE = '[Circular]';
const DEFAULT_OPTIONS = {
  depthLimit: Number.MAX_SAFE_INTEGER,
  edgesLimit: Number.MAX_SAFE_INTEGER,
};

const arr = [];
const replacerStack = [];

function getReplacerVal(key, val) {
  for (let i = 0; i < replacerStack.length; i += 1) {
    const [part0, part1, part2] = replacerStack[i];
    if (part1 === key && part0 === val) {
      replacerStack.splice(i, 1);
      return part2;
    }
  }
  return val;
}

function replaceGetterValues(replacer) {
  return (key, val) => {
    const newVal = getReplacerVal(key, val);
    return replacer ? replacer(key, newVal) : newVal;
  };
}

function setReplace(replace, val, k, parent) {
  const descriptor = Object.getOwnPropertyDescriptor(parent, k);
  if (descriptor.get) {
    if (descriptor.configurable) {
      Object.defineProperty(parent, k, { value: replace });
      arr.push({ parent, key: k, descriptor });
    } else {
      replacerStack.push([val, k, replace]);
    }
  } else {
    // eslint-disable-next-line no-param-reassign
    parent[k] = replace;
    arr.push({ parent, key: k, value: val });
  }
}

function decirc(val, k, edgeIndex, stack, parent, depth, options) {
  const deterministic = options.stable || false;
  if (val !== null && typeof val === 'object') {
    for (let i = 0; i < stack.length; i += 1) {
      if (stack[i] === val) {
        setReplace(CIRCULAR_REPLACE_NODE, val, k, parent);
        return val;
      }
    }
    if (deterministic) {
      try {
        if (typeof val.toJSON === 'function') {
          return val;
        }
      } catch (_) {
        return val;
      }
    }
    if (
      (options.depthLimit !== undefined && depth + 1 > options.depthLimit) ||
      (options.edgesLimit !== undefined && edgeIndex + 1 > options.edgesLimit)
    ) {
      setReplace(LIMIT_REPLACE_NODE, val, k, parent);
      return val;
    }
    stack.push(val);
    if (Array.isArray(val)) {
      for (let i = 0; i < val.length; i += 1) {
        decirc(val[i], i, i, stack, val, depth + 1, options);
      }
    } else if (deterministic) {
      const tmp = {};
      const keys = Object.keys(val).sort((a, b) =>
        // eslint-disable-next-line no-nested-ternary
        a < b ? -1 : a > b ? 1 : 0
      );
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        decirc(val[key], key, i, stack, val, depth + 1, options);
        tmp[key] = val[key];
      }
      if (parent === undefined) {
        return tmp;
      }
      arr.push({ parent, key: k, value: val });
      // eslint-disable-next-line no-param-reassign
      parent[k] = tmp;
    } else {
      const keys = Object.keys(val);
      for (let i = 0; i < keys.length; i += 1) {
        const key = keys[i];
        decirc(val[key], key, i, stack, val, depth + 1, options);
      }
    }
    stack.pop();
  }
  return val;
}

function safeStringify(obj, replacer, spacer, options = DEFAULT_OPTIONS) {
  // eslint-disable-next-line no-param-reassign
  obj = decirc(obj, '', 0, [], undefined, 0, options) || obj;
  try {
    return JSON.stringify(obj, replacerStack.length === 0 ? replacer : replaceGetterValues(replacer), spacer);
  } catch (_) {
    return JSON.stringify('[unable to serialize, circular reference is too complex to analyze]');
  } finally {
    while (arr.length !== 0) {
      const item = arr.pop();
      if (item.descriptor) {
        Object.defineProperty(item.parent, item.key, item.descriptor);
      } else {
        item.parent[item.key] = item.value;
      }
    }
  }
}

function stableStringify(obj, replacer, spacer, options = DEFAULT_OPTIONS) {
  return safeStringify(obj, replacer, spacer, { ...options, stable: true });
}

module.exports = { safeStringify, stableStringify };
