const { describe, it, expect } = require('@xufa/testing');
const { merge } = require('../../lib/fun');

describe('Merge', () => {
  it('Should merge several objects', () => {
    const a = { name: 'John', age: 30, context: { talk: true } };
    const b = { age: 31, context: { sentence: 'Hello' } };
    const c = { context: { talk: false }, extra: { something: 'something' } };
    const expected = {
      name: 'John',
      age: 31,
      context: { talk: false, sentence: 'Hello' },
      extra: { something: 'something' },
    };
    const actual = merge(a, b, c);
    expect(actual).toEqual(expected);
  });
});
