const { describe, it, expect } = require('@xufa/testing');
const { arrSwap, arrMultiSwap } = require('../../lib/fun');

describe('arrSwap', () => {
  it('Should swap two elements of an array', () => {
    const arr = [{ a: 1 }, { a: 2 }, { a: 6 }, { a: 4 }];
    arrSwap(arr, 1, 2);
    expect(arr.length).toBe(4);
    expect(arr[0]).toEqual({ a: 1 });
    expect(arr[1]).toEqual({ a: 6 });
    expect(arr[2]).toEqual({ a: 2 });
    expect(arr[3]).toEqual({ a: 4 });
  });
});

describe('arrMultiSwap', () => {
  it('Should swap two elements of several arrays', () => {
    const arr1 = [{ a: 1 }, { a: 2 }, { a: 6 }, { a: 4 }];
    const arr2 = [{ a: 7 }, { a: 8 }, { a: 9 }, { a: 10 }];
    arrMultiSwap([arr1, arr2], 1, 2);
    expect(arr1.length).toBe(4);
    expect(arr1[0]).toEqual({ a: 1 });
    expect(arr1[1]).toEqual({ a: 6 });
    expect(arr1[2]).toEqual({ a: 2 });
    expect(arr1[3]).toEqual({ a: 4 });
    expect(arr2.length).toBe(4);
    expect(arr2[0]).toEqual({ a: 7 });
    expect(arr2[1]).toEqual({ a: 9 });
    expect(arr2[2]).toEqual({ a: 8 });
    expect(arr2[3]).toEqual({ a: 10 });
  });
});
