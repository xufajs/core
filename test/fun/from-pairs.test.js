const { describe, it, expect } = require('@xufa/testing');
const { fromPairs } = require('../../lib/fun');

describe('fromPairs', () => {
  it('Should create an object from array of pairs', () => {
    expect(
      fromPairs([
        ['a', 1],
        ['b', 2],
        ['c', 3],
      ])
    ).toEqual({ a: 1, b: 2, c: 3 });
  });
});
