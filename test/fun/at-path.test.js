const { describe, it, expect } = require('@xufa/testing');
const { atPath } = require('../../lib/fun');

describe('atPath', () => {
  it('Should extract path tokens from string', () => {
    expect(atPath('[0].a[1].b.c')).toEqual(['[0]', 'a', '[1]', 'b', 'c']);
  });
});
