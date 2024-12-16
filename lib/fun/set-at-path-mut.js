const { curry3 } = require('./curry');
const { atPath } = require('./at-path');

function setAtPathMut(obj, path, value) {
  if (obj === undefined || obj === null) {
    return undefined;
  }
  const routes = Array.isArray(path) ? path : atPath(path);
  let current = obj;
  for (let i = 0; i < routes.length - 1; i += 1) {
    const key = routes[i];
    const route = key.startsWith('[') ? key.slice(1, -1) : key;
    if (current[route] === undefined) {
      const nextRoute = routes[i + 1];
      current[route] = nextRoute.startsWith('[') ? [] : {};
    }
    current = current[route];
  }
  const route = routes[routes.length - 1];
  current[route.startsWith('[') ? route.slice(1, -1) : route] = value;
  return obj;
}

module.exports = { setAtPathMut: curry3(setAtPathMut) };
