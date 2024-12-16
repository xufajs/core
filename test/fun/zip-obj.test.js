const { describe, it, expect } = require('@xufa/testing');
const { zipObj } = require('../../lib/fun');

describe('zipObj', () => {
  it('Should zip an object from two arrays', () => {
    expect(zipObj(['a', 'b', 'c'], [1, 2, 3])).toEqual({ a: 1, b: 2, c: 3 });
  });
  it('Should allow function curry', () => {
    const zipUser = zipObj(['name', 'age']);
    expect(zipUser(['John', 30])).toEqual({ name: 'John', age: 30 });
  });
});
