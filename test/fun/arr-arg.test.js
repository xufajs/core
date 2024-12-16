const { describe, it, expect } = require('@xufa/testing');
const { arrArg, argMin, argMax } = require('../../lib/fun');

describe('arrArg', () => {
  it('Should return index of element in array by function', () => {
    const arr = [{ a: 1 }, { a: 2 }, { a: 6 }, { a: 4 }];
    const fn = (item, val) => item.a > val.a;
    expect(arrArg(arr, { a: 2 }, fn)).toEqual(2);
  });
});

describe('argMin', () => {
  it('Should find the index of the minimum value in an array', () => {
    expect(argMin([3, 2, 6, 4])).toEqual(1);
  });
});

describe('argMax', () => {
  it('Should find the index of the maximum value in an array', () => {
    expect(argMax([3, 2, 6, 4])).toEqual(2);
  });
});
