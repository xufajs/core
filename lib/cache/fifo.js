const { Cache } = require('./cache');

class Fifo extends Cache {
  get first() {
    return this.tail;
  }

  get last() {
    return this.head;
  }

  evict() {
    if (this.size > 0) {
      this.removeNode(this.first);
    }
  }

  push(item) {
    this.put(item);
  }

  pop() {
    if (this.size <= 0) {
      return undefined;
    }
    const item = this.first?.value;
    this.removeNode(this.first);
    return item;
  }

  peek() {
    return this.first?.value;
  }
}

module.exports = { Fifo };
