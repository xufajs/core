const { describe, it, expect } = require('@xufa/testing');
const { concat } = require('../../lib/fun');

describe('concat', () => {
  it('should concat two arrays', () => {
    const a = [1, 2, 3];
    const b = [4, 5, 6];
    const result = concat(a, b);
    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });
});
