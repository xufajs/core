const { describe, it, expect } = require('@xufa/testing');
const { _, or, orFn, gt, lt } = require('../../lib/fun');

describe('orFn', () => {
  it('Should calculate or of two parameters', () => {
    expect(orFn(true, true)()).toBeTruthy();
    expect(orFn(true, false)()).toBeTruthy();
    expect(orFn(false, true)()).toBeTruthy();
    expect(orFn(false, false)()).toBeFalsy();
    expect(orFn(true)(true)()).toBeTruthy();
    expect(orFn(true)(false)()).toBeTruthy();
    expect(orFn(false)(true)()).toBeTruthy();
    expect(orFn(false)(false)()).toBeFalsy();
  });
  it('Should allow to overflow parameters', () => {
    expect(orFn(true, true, true, true)()).toBeTruthy();
    expect(orFn(true, true, true, false)()).toBeTruthy();
    expect(orFn(false, false, false, false)()).toBeFalsy();
  });
  it('Should do the or of two functions', () => {
    // function to check that x less than 0 or greater than 10;
    const outRange = orFn(lt(_, 0), gt(_, 10));
    expect(outRange(-1)).toBeTruthy();
    expect(outRange(0)).toBeFalsy();
    expect(outRange(1)).toBeFalsy();
    expect(outRange(9)).toBeFalsy();
    expect(outRange(10)).toBeFalsy();
    expect(outRange(11)).toBeTruthy();
  });
});

describe('or', () => {
  it('Should calculate or of two parameters', () => {
    expect(or(true, true)).toBeTruthy();
    expect(or(true, false)).toBeTruthy();
    expect(or(false, true)).toBeTruthy();
    expect(or(false, false)).toBeFalsy();
    expect(or(true)(true)).toBeTruthy();
    expect(or(true)(false)).toBeTruthy();
    expect(or(false)(true)).toBeTruthy();
    expect(or(false)(false)).toBeFalsy();
  });
  it('Should allow to overflow parameters', () => {
    expect(or(true, true, true, true)).toBeTruthy();
    expect(or(true, true, true, false)).toBeTruthy();
    expect(or(false, false, false, false)).toBeFalsy();
  });
});
