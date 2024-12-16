class Dict {
  constructor(settings = {}) {
    this.data = new Map();
    this.indexField = settings.indexField || 'id';
    this.indexes = new Map();
    if (settings.indexFields?.length > 0) {
      settings.indexFields.forEach((field) => this.indexes.set(field, new Map()));
    }
  }

  clear() {
    this.data.clear();
    this.indexes.forEach((index) => index.clear());
  }

  get keys() {
    return [...this.indexes.keys()];
  }

  iterateIndexes(value, fn) {
    this.indexes.forEach((index, field) => {
      if (value[field] !== undefined) {
        fn(index, field);
      }
    });
  }

  addIndexes(value) {
    this.iterateIndexes(value, (index, field) => {
      index.set(value[field], value[this.indexField]);
    });
  }

  removeIndexes(value) {
    this.iterateIndexes(value, (index, field) => {
      index.delete(value[field]);
    });
  }

  removeNode(node) {
    this.data.delete(node[this.indexField]);
    this.removeIndexes(node.value);
    return node;
  }

  getNode(id) {
    return this.data.get(id);
  }

  get(id) {
    return this.getNode(id)?.value;
  }

  getIdByIndex(field, value) {
    if (field === this.indexField) {
      return value;
    }
    return this.indexes.get(field)?.get(value);
  }

  getByIndex(field, value) {
    const id = this.getIdByIndex(field, value);
    return id !== undefined ? this.get(id) : undefined;
  }

  newNode(id, value) {
    const node = { id, value, updatedAt: Date.now() };
    this.data.set(id, node);
    this.addIndexes(value);
    return node;
  }

  putNode(node) {
    const id = node.value[this.indexField];
    const existingNode = this.data.get(id);
    if (existingNode) {
      this.removeIndexes(existingNode.value);
      // eslint-disable-next-line no-param-reassign
      node.updatedAt = Date.now();
      this.data.set(id, node);
      this.addIndexes(node.value);
    } else {
      this.data.set(id, node);
      this.addIndexes(node.value);
    }
    return node;
  }

  put(value) {
    const id = value[this.indexField];
    const existingNode = this.data.get(id);
    if (existingNode) {
      this.removeIndexes(existingNode.value);
      existingNode.updatedAt = Date.now();
      existingNode.value = value;
      this.addIndexes(value);
      return existingNode;
    }
    return this.newNode(id, value);
  }

  remove(id) {
    const node = this.data.get(id);
    return node ? this.removeNode(node) : undefined;
  }

  fill(obj) {
    obj.data.forEach((node) => this.put(node.value));
  }
}

module.exports = { Dict };
