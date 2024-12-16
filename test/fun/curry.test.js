const { describe, it, expect } = require('@xufa/testing');
const { _, curry2, curry3, curryN, curry } = require('../../lib/fun');

function fn1(a) {
  return a;
}

function fn2(a, b) {
  return a * 10 + b;
}

function fn3(a, b, c) {
  return a * 100 + b * 10 + c;
}

function fn4(a, b, c, d) {
  return a * 1000 + b * 100 + c * 10 + d;
}

function min(...args) {
  return Math.min(...args);
}

describe('Curry 2', () => {
  it('Should currify a two params function', () => {
    const cfn2 = curry2(fn2);
    expect(cfn2(1, 2)).toEqual(12);
    expect(cfn2(1)(2)).toEqual(12);
    expect(cfn2()(1, 2)).toEqual(12);
    expect(cfn2()(1)(2)).toEqual(12);
  });
  it('Should allow a placeholder in a two params function', () => {
    const cfn2 = curry2(fn2);
    const cfn2x2 = cfn2(_, 2);
    const cfn21x = cfn2(1, _);
    const cfn2x = cfn2(_);
    const cfn2xx = cfn2(_, _);
    expect(cfn2x2(1)).toEqual(12);
    expect(cfn2x2(2)).toEqual(22);
    expect(cfn21x(1)).toEqual(11);
    expect(cfn21x(2)).toEqual(12);
    expect(cfn2x(1, 2)).toEqual(12);
    expect(cfn2x(1)(2)).toEqual(12);
    expect(cfn2x()(1, 2)).toEqual(12);
    expect(cfn2x()(1)(2)).toEqual(12);
    expect(cfn2xx(1, 2)).toEqual(12);
    expect(cfn2xx(1)(2)).toEqual(12);
    expect(cfn2xx()(1, 2)).toEqual(12);
    expect(cfn2xx()(1)(2)).toEqual(12);
  });
  it('Should allow to overflow params', () => {
    const cmin = curry2(min);
    expect(cmin(5, 4, 3, 1, 2)).toEqual(1);
  });
});

describe('Curry 3', () => {
  it('Should currify a 3 params function', () => {
    const cfn3 = curry3(fn3);
    expect(cfn3(1, 2, 3)).toEqual(123);
    expect(cfn3(1, 2)(3)).toEqual(123);
    expect(cfn3(1)(2, 3)).toEqual(123);
    expect(cfn3(1)(2)(3)).toEqual(123);
    expect(cfn3()(1, 2, 3)).toEqual(123);
    expect(cfn3()(1, 2)(3)).toEqual(123);
    expect(cfn3()(1)(2, 3)).toEqual(123);
    expect(cfn3()(1)(2)(3)).toEqual(123);
  });
  it('Should allow a placeholder in a two params function', () => {
    const cfn3 = curry3(fn3);
    const cfn3xx3 = cfn3(_, _, 3);
    const cfn3x23 = cfn3(_, 2, 3);
    const cfn3x2x = cfn3(_, 2, _);
    const cfn31xx = cfn3(1, _, _);
    const cfn31x3 = cfn3(1, _, 3);
    const cfn312x = cfn3(1, 2, _);
    const cfn3x = cfn3(_);
    const cfn3xx = cfn3(_, _);
    const cfn31x = cfn3(1, _);
    const cfn312 = cfn3(1, 2);
    const cfn3x2 = cfn3(_, 2);
    const cfn3xxx = cfn3(_, _, _);
    expect(cfn3xx3(1, 2)).toEqual(123);
    expect(cfn3xx3(1)(2)).toEqual(123);
    expect(cfn3x23(1)).toEqual(123);
    expect(cfn3x2x(1, 3)).toEqual(123);
    expect(cfn3x2x(1)(3)).toEqual(123);
    expect(cfn31xx(2, 3)).toEqual(123);
    expect(cfn31xx(2)(3)).toEqual(123);
    expect(cfn31x3(2)).toEqual(123);
    expect(cfn312x(3)).toEqual(123);
    expect(cfn3x(1, 2, 3)).toEqual(123);
    expect(cfn3xx(1, 2, 3)).toEqual(123);
    expect(cfn31x(2, 3)).toEqual(123);
    expect(cfn31x(2)(3)).toEqual(123);
    expect(cfn312(3)).toEqual(123);
    expect(cfn3x2(1, 3)).toEqual(123);
    expect(cfn3x2(1)(3)).toEqual(123);
    expect(cfn3xxx(1, 2, 3)).toEqual(123);
  });
  it('Should allow to overflow params', () => {
    const cmin = curry3(min);
    expect(cmin(5, 4, 3, 1, 2)).toEqual(1);
  });
});

describe('Curry N', () => {
  it('Should currify functions of 1 param', () => {
    const cfn1 = curryN(1, fn1);
    expect(cfn1(1)).toEqual(1);
  });
  it('Should currify functions of 2 param', () => {
    const cfn2 = curryN(2, fn2);
    expect(cfn2(1, 2)).toEqual(12);
  });
  it('Should currify functions of 3 param', () => {
    const cfn3 = curryN(3, fn3);
    expect(cfn3(1, 2, 3)).toEqual(123);
  });
  it('Should currify functions of 4 param', () => {
    const cfn4 = curryN(4, fn4);
    expect(cfn4(1, 2, 3, 4)).toEqual(1234);
    expect(cfn4(1)(2, 3, 4)).toEqual(1234);
  });
  it('allows to have placeholders', () => {
    const cfn4 = curryN(4, fn4);
    const cfn4x23x = cfn4(_, 2, 3, _);
    expect(cfn4x23x(1, 4)).toEqual(1234);
    expect(cfn4x23x(1)(4)).toEqual(1234);
  });
  it('Should allow to overflow', () => {
    const cmin = curryN(6, min);
    expect(cmin(10, 9, 8, 7, 6, 5, 4, 3, 1, 2)).toEqual(1);
  });
});

describe('curry', () => {
  it('Should currify a function based on the number of arguments', () => {
    const cfn1 = curry(fn1);
    expect(cfn1(1)).toEqual(1);
    const cfn2 = curry(fn2);
    expect(cfn2(1)(2)).toEqual(12);
    const cfn3 = curry(fn3);
    expect(cfn3(1)(2)(3)).toEqual(123);
    const cfn4 = curry(fn4);
    expect(cfn4(1)(2)(3)(4)).toEqual(1234);
  });
});
