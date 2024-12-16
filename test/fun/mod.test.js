const { describe, it, expect } = require('@xufa/testing');
const { mod } = require('../../lib/fun');

describe('Mod', () => {
  it('Should calculate modulus', () => {
    expect(mod(45, 7)).toEqual(3);
  });
});
