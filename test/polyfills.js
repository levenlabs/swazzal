/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import { arrayReduce } from '../src/polyfills';

describe('arrayReduce', function() {

  it('arrayReduce should reduce', function () {
    function r(arr, e) {
      return arr;
    }
    const a = [];
    assert.strictEqual(arrayReduce([[], []], r, a), a);
  });

  it('arrayReduce should reduce despite broken reduce', function () {
    function r(arr, e) {
      return arr;
    }
    const a = [[]];
    const b = [];
    // emulate broken prototype.js
    a.reduce = function() { return a[0]; };
    assert.strictEqual(arrayReduce(a, r, b), b);
  });

});
