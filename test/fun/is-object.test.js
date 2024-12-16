const { describe, it, expect } = require('@xufa/testing');
const { isObject } = require('../../lib/fun');

describe('IsObject', () => {
  it('Should return true if an object is provided', () => {
    expect(isObject({})).toBeTruthy();
  });
  it('Should return false if no object is provided', () => {
    expect(isObject([])).toBeFalsy();
  });
});
