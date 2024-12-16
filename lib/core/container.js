const { isClass } = require('../fun/is-class');
const { logger } = require('./logger');
const { Dict } = require('./dict');
const { Cache } = require('../cache/cache');
const { CacheTenants } = require('../cache/cache-tenants');

class Container {
  constructor() {
    this.items = {};
    this.register(Dict);
    this.register(Cache);
    this.register(CacheTenants);
  }

  static getName(obj) {
    if (typeof obj === 'string') {
      return obj;
    }
    if (isClass(obj)) {
      return obj.name;
    }
    return obj.constructor?.name !== 'Function' ? obj.constructor.name : obj.name;
  }

  register(name, value) {
    if (typeof name !== 'string') {
      this.register(Container.getName(name), name);
    }
    this.items[name] = value;
  }

  get(name) {
    return this.items[name];
  }

  remove(name) {
    delete this.items[name];
  }

  getInstance(name, settings) {
    const clazz = this.get(name);
    if (!clazz || !isClass(clazz)) {
      return clazz;
    }
    const initializer = this.get(`init${name}`) || ((Clazz, opts) => new Clazz(opts));
    return initializer(clazz, settings);
  }
}

let ioc = new Container();
ioc.register('logger', logger);

function setIoc(container) {
  ioc = container;
}

module.exports = {
  Container,
  ioc,
  setIoc,
};
