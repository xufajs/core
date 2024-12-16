const { describe, it, expect } = require('@xufa/testing');
const { not } = require('../../lib/fun');
const Vector = require('../core/vector');

describe('not', () => {
  it('Should negate value provided', () => {
    expect(not(true)).toEqual(false);
    expect(not(false)).toEqual(true);
  });
  it('Should not an object with notOp', () => {
    const inputA = new Vector([1, 2, 3]);
    const inputB = new Vector([1, 2, -3]);
    expect(not(inputA)).toEqual(false);
    expect(not(inputB)).toEqual(true);
  });
});
