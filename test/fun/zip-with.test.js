const { describe, it, expect } = require('@xufa/testing');
const { zipWith } = require('../../lib/fun');

function add(a, b) {
  return a + b;
}

describe('zipWith', () => {
  it('Should zip two arrays using a function', () => {
    expect(zipWith([1, 2, 3], [4, 5, 6], add)).toEqual([5, 7, 9]);
  });
});
