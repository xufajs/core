const { describe, it, expect } = require('@xufa/testing');
const { negate } = require('../../lib/fun');
const Vector = require('../core/vector');

describe('Negate', () => {
  it('Should negate the input', () => {
    expect(negate(8)).toEqual(-8);
  });
  it('Should negate an object with negateOp', () => {
    const input = new Vector([1, 2, 3]);
    const expected = [-1, -2, -3];
    const actual = negate(input);
    expect(actual.arr).toEqual(expected);
  });
});
