const { describe, it, expect } = require('@xufa/testing');
const { pow } = require('../../lib/fun');

describe('Pow', () => {
  it('Should calculate a to the power of b', () => {
    expect(pow(3, 5)).toEqual(243);
  });
});
