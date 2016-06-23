/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import unique from '../src/arrayUnique';

describe('arrayUnique', function() {

    it('removes duplicate objects', function() {
        assert.deepEqual(unique([4, 2, 1, 1, 2, 2, 3, 4]), [4, 2, 1, 3]);
    });

    it('uses strict equal', function() {
        assert.deepEqual(unique(['a', 'A', 'a', 'b', '2', 2]), ['a', 'A', 'b', '2', 2]);
    });

    it('doesn\'t touch unique array', function() {
        assert.deepEqual(unique([1, 2, 3]), [1, 2, 3]);
    });

    it('doesn\'t alter array', function() {
        const arr = [1, 1, 2, 3];
        assert.deepEqual(unique(arr), [1, 2, 3]);
        assert.deepEqual(arr, [1, 1, 2, 3]);
    });

});
