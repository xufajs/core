const { describe, it, expect } = require('@xufa/testing');
const { gte } = require('../../lib/fun');

describe('gte', () => {
  it('Should return true if a > b', () => {
    expect(gte(8, 7)).toBeTruthy();
  });
  it('Should return true if a = b', () => {
    expect(gte(8, 8)).toBeTruthy();
  });
  it('Should return false if a < b', () => {
    expect(gte(8, 9)).toBeFalsy();
  });
});
