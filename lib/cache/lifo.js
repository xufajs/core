const { Fifo } = require('./fifo');

class Lifo extends Fifo {
  get first() {
    return this.head;
  }

  get last() {
    return this.tail;
  }
}

module.exports = { Lifo };
