const { describe, it, expect } = require('@xufa/testing');
const { max } = require('../../lib/fun');

describe('Max', () => {
  it('Should return the max value of a pair', () => {
    expect(max(2, 1)).toEqual(2);
    expect(max(2, 3)).toEqual(3);
    expect(max(2)(1)).toEqual(2);
    expect(max(2)(3)).toEqual(3);
  });
  it('Should allow param overflow', () => {
    expect(max(2, 1, 3, 4, 5, 7, 6)).toEqual(7);
  });
});
