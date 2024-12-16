function getMethods(obj) {
  const result = {};
  let current = obj;
  while (current) {
    const names = Object.getOwnPropertyNames(current);
    for (let i = 0; i < names.length; i += 1) {
      const prop = names[i];
      if (typeof current[prop] === 'function') {
        result[prop] = true;
      }
    }
    current = Object.getPrototypeOf(current);
  }
  return Object.keys(result);
}

module.exports = { getMethods };
