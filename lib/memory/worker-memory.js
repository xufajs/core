const cluster = require('node:cluster');
const { v4 } = require('../core/uuid');
const { serialize } = require('../core/serialize');
const { deserialize } = require('../core/deserialize');

class WorkerMemory {
  constructor() {
    this.callbacks = {};
    process.on('message', (srcData) => {
      if (srcData?.isMemoryMessage) {
        const data = deserialize(srcData);
        const cb = this.callbacks[data.uuid];
        if (typeof cb === 'function') {
          cb(data.value);
        }
        delete this.callbacks[data.uuid];
      }
    });
  }

  handle(method, settings, cb) {
    const uuid = v4();
    const msg = serialize({ ...settings, method, uuid, wid: cluster.worker.id, pid: process.pid });
    msg.isMemoryMessage = true;
    process.send(msg);
    this.callbacks[uuid] = cb;
  }

  put(settings) {
    return new Promise((resolve) => {
      this.handle('put', settings, () => resolve());
    });
  }

  get(settings) {
    return new Promise((resolve) => {
      this.handle('get', settings, (value) => resolve(value));
    });
  }

  remove(settings) {
    return new Promise((resolve) => {
      this.handle('remove', settings, () => resolve());
    });
  }

  clear(settings) {
    return new Promise((resolve) => {
      this.handle('clear', settings, () => resolve());
    });
  }

  isExpired(settings) {
    return new Promise((resolve) => {
      this.handle('isExpired', settings, (value) => resolve(value));
    });
  }
}

module.exports = { WorkerMemory };
