const { describe, it, expect } = require('@xufa/testing');
const { lte } = require('../../lib/fun');

describe('lte', () => {
  it('Should return true if a < b', () => {
    expect(lte(8, 9)).toBeTruthy();
  });
  it('Should return true if a = b', () => {
    expect(lte(8, 8)).toBeTruthy();
  });
  it('Should return false if a > b', () => {
    expect(lte(8, 7)).toBeFalsy();
  });
});
