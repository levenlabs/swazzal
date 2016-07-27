/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import reduceParents from '../src/reduceParents';
import { arrayReduce } from '../src/polyfills';

describe('reduceParents', function() {

    it('removes 1 child from array with its parent', function() {
        const div = makeElement('<div><div></div></div>');
        assert.deepEqual(arrayReduce([div, div.firstChild], reduceParents, []), [div]);
    });

    it('removes 2 children from array with its parent', function() {
        const div = makeElement('<div><div></div><div></div></div>');
        assert.deepEqual(arrayReduce([div, div.firstChild, div.firstChild.nextSibling], reduceParents, []), [div]);
    });

    it('keeps all parents', function() {
        const div = makeElement('<div></div><div><div></div></div>');
        assert.deepEqual(arrayReduce([div, div.nextSibling, div.nextSibling.firstChild], reduceParents, []), [div, div.nextSibling]);
    });

});
