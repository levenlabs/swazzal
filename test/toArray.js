/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import toArray from '../src/toArray';

describe('toArray', function() {

    it('toArray converts an HTMLCollection to an array', function() {
        const div = makeElement('<div><span></span><span></span></div>');
        const arr = toArray(div.children);
        assert.isFunction(arr.slice);
    });

});
