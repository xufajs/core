const { describe, it, expect } = require('@xufa/testing');
const { has } = require('../../lib/fun');

describe('has', () => {
  it('Should return true if the property exists', () => {
    expect(has({ name: 'John' }, 'name')).toBeTruthy();
  });
  it('Should return false if the property does not exists', () => {
    expect(has({ name: 'John' }, 'age')).toBeFalsy();
  });
  it('Should return false if the property belongs to the prototype', () => {
    const Person = function PersonFun() {};
    Person.prototype.name = 'John';
    expect(has(new Person(), 'name')).toBeFalsy();
  });
});
