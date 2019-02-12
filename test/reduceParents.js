/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import { reduceParents } from '../src/browsers';

describe('reduceParents', function() {

    it('removes 1 child from array with its parent', function() {
        const div = makeElement('<div><div></div></div>');
        assert.deepEqual([div, div.firstChild].reduce(reduceParents, []), [div]);
    });

    it('removes 2 children from array with its parent', function() {
        const div = makeElement('<div><div></div><div></div></div>');
        assert.deepEqual([div, div.firstChild, div.firstChild.nextSibling].reduce(reduceParents, []), [div]);
    });

    it('keeps all parents', function() {
        const div = makeElement('<div></div><div><div></div></div>');
        assert.deepEqual([div, div.nextSibling, div.nextSibling.firstChild].reduce(reduceParents, []), [div, div.nextSibling]);
    });

});
