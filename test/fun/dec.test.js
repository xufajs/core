const { describe, it, expect } = require('@xufa/testing');
const { dec } = require('../../lib/fun');

describe('Dec', () => {
  it('Should substract 1 from a number', () => {
    expect(dec(10)).toEqual(9);
  });
});
