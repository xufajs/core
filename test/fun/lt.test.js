const { describe, it, expect } = require('@xufa/testing');
const { lt } = require('../../lib/fun');

describe('lt', () => {
  it('Should return true if a < b', () => {
    expect(lt(8, 9)).toBeTruthy();
  });
  it('Should return false if a = b', () => {
    expect(lt(8, 8)).toBeFalsy();
  });
  it('Should return false if a > b', () => {
    expect(lt(8, 7)).toBeFalsy();
  });
});
