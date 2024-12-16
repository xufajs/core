const { describe, it, expect } = require('@xufa/testing');
const { inc } = require('../../lib/fun');

describe('Inc', () => {
  it('Should add 1', () => {
    expect(inc(10)).toEqual(11);
  });
});
