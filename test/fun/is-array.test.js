const { describe, it, expect } = require('@xufa/testing');
const { isArray } = require('../../lib/fun');

describe('IsArray', () => {
  it('Should identity an array', () => {
    expect(isArray([])).toBeTruthy();
  });
  it('Should return false if no array is provided', () => {
    expect(isArray(undefined)).toBeFalsy();
    expect(isArray(null)).toBeFalsy();
    expect(isArray({})).toBeFalsy();
    expect(isArray('str')).toBeFalsy();
  });
});
