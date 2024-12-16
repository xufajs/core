const { describe, it, expect } = require('@xufa/testing');
const { always } = require('../../lib/fun');

describe('Always', () => {
  it('Should return a function that always return the same value', () => {
    expect(always(5)()).toEqual(5);
  });
});
