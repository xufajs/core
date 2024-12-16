const { describe, it, expect } = require('@xufa/testing');
const { andOp } = require('../../lib/fun');
const Vector = require('../core/vector');

describe('AndOp', () => {
  it('Should calculate and of two parameters', () => {
    expect(andOp(true, true)).toBeTruthy();
    expect(andOp(true, false)).toBeFalsy();
    expect(andOp(false, true)).toBeFalsy();
    expect(andOp(false, false)).toBeFalsy();
  });
  it('Should calculate and when some parameters are instances from class with andOp', () => {
    const vectorA = new Vector([1, 2, 3]);
    const vectorB = new Vector([-1, -2, -3]);
    expect(andOp(true, vectorA)).toBeTruthy();
    expect(andOp(false, vectorA)).toBeFalsy();
    expect(andOp(vectorA, vectorA)).toBeTruthy();
    expect(andOp(vectorA, true)).toBeTruthy();
    expect(andOp(true, vectorB)).toBeFalsy();
    expect(andOp(vectorB, vectorB)).toBeFalsy();
    expect(andOp(vectorB, true)).toBeFalsy();
  });
});
