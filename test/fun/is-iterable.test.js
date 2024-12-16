const { describe, it, expect } = require('@xufa/testing');
const { isIterable } = require('../../lib/fun');

describe('isIterable', () => {
  it('Should return false if no input is provided', () => {
    expect(isIterable(undefined)).toBeFalsy();
  });
  it('Should return false if input is not iterable', () => {
    expect(isIterable({})).toBeFalsy();
  });
});
