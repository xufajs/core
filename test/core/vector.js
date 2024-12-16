const AND_TAG = '@@tag/and';
const NOT_TAG = '@@tag/not';
const NEGATE_TAG = '@@tag/negate';
const DIV_TAG = '@@tag/div';
const ADD_TAG = '@@tag/add';

class Vector {
  constructor(arr = []) {
    this.arr = [...arr];
  }

  get length() {
    return this.arr.length;
  }

  push(value) {
    this.arr.push(value);
  }

  static clone(vector) {
    return new Vector(vector.arr);
  }

  static [ADD_TAG](a, b) {
    const l = Math.min(a.length, b.length);
    const result = new Vector();
    for (let i = 0; i < l; i += 1) {
      result.push(a.arr[i] + b.arr[i]);
    }
    return result;
  }

  static [DIV_TAG](a, b) {
    if (a instanceof Vector) {
      const result = new Vector();
      const numb = Number(b);
      for (let i = 0; i < a.length; i += 1) {
        result.push(a.arr[i] / numb);
      }
      return result;
    }
    if (b instanceof Vector) {
      const result = new Vector();
      for (let i = 0; i < b.length; i += 1) {
        result.push(a / b.arr[i]);
      }
      return result;
    }
    return a / b;
  }

  static [NEGATE_TAG](a) {
    const l = a.length;
    const result = new Vector();
    for (let i = 0; i < l; i += 1) {
      result.push(-a.arr[i]);
    }
    return result;
  }

  static [NOT_TAG](a) {
    const l = a.length;
    let total = 0;
    for (let i = 0; i < l; i += 1) {
      total += a.arr[i];
    }
    return total <= 0;
  }

  static [AND_TAG](a, b) {
    const valueA = a instanceof Vector ? !Vector[NOT_TAG](a) : a;
    const valueB = b instanceof Vector ? !Vector[NOT_TAG](b) : b;
    return valueA && valueB;
  }
}

module.exports = Vector;
