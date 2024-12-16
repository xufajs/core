class Cache {
  constructor(settings = {}) {
    this.initializeCache(settings);
  }

  initializeCache(settings) {
    this.data = new Map();
    this.indexField = settings.indexField || 'id';
    this.capacity = settings.capacity || 1000;
    this.maxAge = settings.maxAge || 900;
    this.autoRemoveExpired = settings.autoRemoveExpired ?? true;
    this.initializeIndexes(settings.indexFields);
    if (settings.indexFields?.length > 0) {
      this.indexes = new Map();
      settings.indexFields.forEach((field) => this.indexes.set(field, new Map()));
    }
    this.head = undefined;
    this.tail = undefined;
  }

  initializeIndexes(indexFields) {
    if (indexFields?.length > 0) {
      this.indexes = new Map();
      indexFields.forEach((field) => this.indexes.set(field, new Map()));
    }
  }

  clear() {
    this.data.clear();
    this.head = undefined;
    this.tail = undefined;
  }

  get keys() {
    return this.indexes ? [...this.indexes.keys()] : [];
  }

  get size() {
    return this.data.size;
  }

  iterateIndexes(value, fn) {
    this.keys.forEach((field) => {
      if (value[field]) {
        const index = this.indexes.get(field);
        fn(index, field);
      }
    });
  }

  addIndexes(value) {
    if (this.indexes) {
      this.iterateIndexes(value, (index, field) => {
        index.set(value[field], value[this.indexField]);
      });
    }
  }

  removeIndexes(value) {
    if (this.indexes) {
      this.iterateIndexes(value, (index, field) => {
        index.delete(value[field]);
      });
    }
  }

  addToFront(srcNode) {
    const node = srcNode;
    if (this.head) {
      node.next = this.head;
      this.head.prev = node;
    }
    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.data.set(node[this.indexField], node);
    return node;
  }

  removeFromList(srcNode) {
    const node = srcNode;
    if (this.tail === node) {
      this.tail = node.prev;
    }
    if (node.prev) {
      node.prev.next = node.next;
    }
    if (node.next) {
      node.next.prev = node.prev;
    }
    node.prev = undefined;
    node.next = undefined;
  }

  moveToFront(srcNode) {
    const node = srcNode;
    if (this.head === node) {
      return node;
    }
    this.removeFromList(node);
    return this.addToFront(node);
  }

  removeNode(node) {
    if (this.head === node) {
      this.head = node.next;
    }
    this.removeFromList(node);
    this.data.delete(node[this.indexField]);
    this.removeIndexes(node.value);
    return node;
  }

  removeOld() {
    return this.tail ? this.removeNode(this.tail) : undefined;
  }

  isNodeExpired(node) {
    if (!this.maxAge || this.maxAge === Infinity) {
      return false;
    }
    return Math.floor((Date.now() - node.updatedAt) / 1000) > this.maxAge;
  }

  isExpired(id) {
    const node = this.data.get(id);
    return node ? this.isNodeExpired(node) : false;
  }

  getNode(id) {
    const node = this.data.get(id);
    if (!node) {
      return undefined;
    }
    if (this.maxAge && this.autoRemoveExpired && this.isNodeExpired(node)) {
      this.removeNode(node);
      return undefined;
    }
    return this.moveToFront(node);
  }

  get(id) {
    return this.getNode(id)?.value;
  }

  getAll() {
    const ids = [...this.data.keys()];
    const values = ids.map((id) => this.get(id));
    return values;
  }

  getIdByIndex(field, value) {
    if (field === this.indexField) {
      return value;
    }
    if (!this.indexes) {
      return undefined;
    }
    const index = this.indexes.get(field);
    return index?.get(value);
  }

  getByIndex(field, value) {
    const id = this.getIdByIndex(field, value);
    return id ? this.get(id) : undefined;
  }

  enforceCapacity() {
    while (this.data.size > this.capacity) {
      this.removeOld();
    }
  }

  newNode(id, value) {
    const node = { id, value, updatedAt: Date.now() };
    this.addToFront(node);
    this.addIndexes(value);
    this.enforceCapacity();
    return node;
  }

  updateExistingNode(srcNode, newValue) {
    const node = srcNode;
    this.removeIndexes(node.value);
    node.updatedAt = Date.now();
    node.value = newValue;
    this.moveToFront(node);
    this.addIndexes(newValue);
    return node;
  }

  putNode(node) {
    const id = node.value[this.indexField];
    const existingNode = this.data.get(id);
    if (existingNode) {
      return this.updateExistingNode(existingNode, node.value);
    }
    this.addToFront(node);
    this.addIndexes(node.value);
    this.enforceCapacity();
    return node;
  }

  put(value) {
    const id = value[this.indexField];
    const node = this.data.get(id);
    if (node) {
      return this.updateExistingNode(node, value);
    }
    return this.newNode(id, value);
  }

  remove(id) {
    const node = this.data.get(id);
    return node ? this.removeNode(node) : undefined;
  }

  removeMany(ids) {
    ids.forEach((id) => this.remove(id));
  }

  setCapacity(capacity) {
    this.capacity = capacity;
    this.enforceCapacity();
  }

  fill(data) {
    data.forEach((node) => {
      this.put(node.value);
    });
  }
}

module.exports = { Cache };
