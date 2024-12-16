const cluster = require('node:cluster');
const { ioc } = require('../core/container');
const { logger } = require('../core/logger');
const { serialize } = require('../core/serialize');
const { deserialize } = require('../core/deserialize');

class PrimaryMemory {
  constructor() {
    this.data = {};
    cluster.on('online', (worker) => {
      worker.on('message', (srcData) => {
        if (srcData?.isMemoryMessage) {
          const data = deserialize(srcData);
          this.handle(data, worker);
        }
      });
    });
  }

  handle(data, worker) {
    const msg = serialize({
      id: data.id,
      uuid: data.uuid,
      value: this[data.method](data),
    });
    msg.isMemoryMessage = true;
    try {
      worker.send(msg);
    } catch (err) {
      logger.error(err);
    }
  }

  configureCollection({ collectionName, collectionType, settings }) {
    if (this.data[collectionName]) {
      const previous = this.data[collectionName];
      this.data[collectionName] = ioc.getInstance(collectionType, settings);
      this.data[collectionName].fill(previous);
    } else {
      this.data[collectionName] = ioc.getInstance(collectionType, settings);
    }
  }

  configure({ collections }) {
    if (collections) {
      Object.entries(collections).forEach(([collectionName, value]) => {
        this.configureCollection({ collectionName, ...value });
      });
    }
  }

  put({ key, tenantId, value }) {
    let collection = this.data[key];
    if (!collection) {
      if (tenantId) {
        this.configureCollection({ collectionName: key, collectionType: 'CacheTenants' });
      } else {
        this.configureCollection({ collectionName: key, collectionType: 'Dict' });
      }
      collection = this.data[key];
    }
    if (tenantId) {
      return collection?.put(tenantId, value);
    }
    return collection?.put(value);
  }

  get({ key, tenantId, id, field, value }) {
    const collection = this.data[key];
    if (!collection) {
      return undefined;
    }
    if (tenantId) {
      if (field && value) {
        return collection?.getByIndex(tenantId, field, value);
      }
      return id ? collection?.get(tenantId, id) : collection.getTenant(tenantId);
    }
    if (field && value) {
      return collection?.getByIndex(field, value);
    }
    return id ? collection?.get(id) : collection;
  }

  remove({ key, tenantId, id }) {
    if (id) {
      if (tenantId) {
        this.data[key]?.remove(tenantId, id);
      } else {
        this.data[key]?.remove(id);
      }
    } else {
      delete this.data[key];
    }
  }

  clear({ key, tenantId }) {
    if (key) {
      if (tenantId) {
        this.data[key]?.clear(tenantId);
      } else {
        this.data[key]?.clear();
      }
    } else {
      this.data = {};
    }
  }

  isExpired({ key, tenantId, id, node }) {
    const collection = this.data[key];
    if (tenantId) {
      return node ? !!collection?.isNodeExpired(tenantId, node) : collection?.isExpired(tenantId, id);
    }
    return node ? !!collection?.isNodeExpired(node) : collection?.isExpired(id);
  }
}

module.exports = { PrimaryMemory };
