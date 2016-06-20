/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import { parse } from '../src';

describe('parse', function() {

  it('should correctly parse div:id=foo', function () {
    const rule = parse('id=foo');
    assert.lengthOf(rule.identifiers, 1);
    assert.equal(rule.identifiers[0].property, 'id');
    assert.equal(rule.identifiers[0].value, 'foo');
  });

  it('should correctly parse div:id=foo;cl=bar', function () {
    const rule = parse('id=foo;cl=bar');
    assert.lengthOf(rule.identifiers, 2);
    assert.equal(rule.identifiers[0].property, 'id');
    assert.equal(rule.identifiers[0].value, 'foo');
    assert.equal(rule.identifiers[1].property, 'cl');
    assert.equal(rule.identifiers[1].value, 'bar');
  });

});
