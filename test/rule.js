/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import { Rule, Identifier } from '../src';

describe('Rule', function() {

  describe('Rule()', function () {

    it('rule([]) should set identifiers to []', function () {
      const r = new Rule([]);
      assert.deepEqual(r.identifiers, []);
    });

    it('rule([i]) should set identifiers to [i]', function () {
      const i = new Identifier('id', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.identifiers, [i]);
    });

  });

  describe('encode()', function () {

    it('should return div:id=foo', function () {
      const i = new Identifier('id', 'foo');
      const r = new Rule([i]);
      assert.equal('id=foo', r.encode());
    });

    it('should return div:id=foo;cl=bar', function () {
      const i = new Identifier('id', 'foo');
      const i2 = new Identifier('cl', 'bar');
      const r = new Rule([i, i2]);
      assert.deepEqual('id=foo;cl=bar', r.encode());
    });

  });

  describe('locateRoots()', function () {

    it('roots for id=foo should return div with id=bar', function () {
      const el = makeElement('<div id="foo"></div>');
      const i = new Identifier('id', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateRoots(document), [el]);
    });

    it('roots for pid=foo should return div with id=bar', function () {
      const el = makeElement('<div id="foo"></div>');
      const i = new Identifier('pid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateRoots(document), [el]);
    });

    it('roots for ppid=foo should return div with id=bar', function () {
      const el = makeElement('<div id="foo"></div>');
      const i = new Identifier('ppid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateRoots(document), [el]);
    });

    it('roots for id=~foo should return [document]', function () {
      const el = makeElement('<div id="foo"></div>');
      const i = new Identifier('id', '~foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateRoots(document), [document.documentElement]);
    });

    // only run these tests in ie8+
    if (typeof document.querySelectorAll === 'function') {
      it('roots for cl=foo should return all elements with class foo', function () {
        const el = makeElement('<div class="foo"></div><div class="foo"></div>');
        const i = new Identifier('cl', 'foo');
        const r = new Rule([i]);
        assert.deepEqual(r.locateRoots(document), [el, el.nextSibling]);
      });

      it('roots for cl=foo should return all parents with class foo', function () {
        const el = makeElement('<div class="foo"><div class="foo"></div></div>');
        const i = new Identifier('cl', 'foo');
        const r = new Rule([i]);
        assert.deepEqual(r.locateRoots(document), [el]);
      });

      it('roots for pcl=foo should return all elements with class foo', function () {
        const el = makeElement('<div class="foo"></div><div class="foo"></div>');
        const i = new Identifier('pcl', 'foo');
        const r = new Rule([i]);
        assert.deepEqual(r.locateRoots(document), [el, el.nextSibling]);
      });

      it('roots for ppcl=foo should return all elements with class foo', function () {
        const el = makeElement('<div class="foo"></div><div class="foo"></div>');
        const i = new Identifier('ppcl', 'foo');
        const r = new Rule([i]);
        assert.deepEqual(r.locateRoots(document), [el, el.nextSibling]);
      });
    }

    it('roots for cl=~foo should return [documentElement]', function () {
      const el = makeElement('<div id="foo"></div>');
      const i = new Identifier('cl', '~foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateRoots(document), [document.documentElement]);
    });

  });

  describe('locateElements()', function () {

    it('id=foo should match a div with id=bar', function () {
      const el = makeElement('<div id="foo"></div>');
      const i = new Identifier('id', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

    it('id=foo should match a child div with id=bar', function () {
      const el = makeElement('<div><div id="foo"></div></div>').firstChild;
      const i = new Identifier('id', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

    it('id=foo should not match a div with id=bar', function () {
      const el = makeElement('<div id="bar"></div>');
      const i = new Identifier('id', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), []);
    });

    it('tag=div should not match a span', function () {
      const el = makeElement('<span></span>');
      const i = new Identifier('tag', 'div');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), []);
    });

    it('pid=foo should not match a div', function () {
      const el = makeElement('<div></div>');
      const i = new Identifier('pid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), []);
    });

    it('pid=foo should match a div with a parent with id=foo', function () {
      const el = makeElement('<div id="foo"><div></div></div>').firstChild;
      const i = new Identifier('pid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

    it('ppid=foo should match a div with a parent with id=foo', function () {
      const el = makeElement('<div id="foo"><div></div></div>').firstChild;
      const i = new Identifier('ppid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

    it('ppid=foo should match 1 parent div with a parent with id=foo', function () {
      const el = makeElement('<div id="foo"><div><div></div></div></div>').firstChild;
      const i = new Identifier('ppid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

    it('ppid=foo should match 2 div with a parent with id=foo', function () {
      const el = makeElement('<div id="foo"><div></div><div></div></div>').firstChild;
      const i = new Identifier('ppid', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el, el.nextSibling]);
    });

    it('cl=foo should match a div with a class=foo', function () {
      const el = makeElement('<div class="foo"></div>');
      const i = new Identifier('cl', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

    it('cl=foo should match all divs with a class=foo', function () {
      const el = makeElement('<div class="foo"></div><div class="foo"></div><div class="foo"></div>');
      const i = new Identifier('cl', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el, el.nextSibling, el.nextSibling.nextSibling]);
    });

    it('cl=foo should match nested divs with a class=foo', function () {
      const el = makeElement('<div class="bar"><div class="foo"></div></div><div class="foo"></div>');
      const i = new Identifier('cl', 'foo');
      const r = new Rule([i]);
      assert.deepEqual(r.locateElements(document), [el.firstChild, el.nextSibling]);
    });

    it('cl=foo;tag=div should match only divs with a class=foo', function () {
      const el = makeElement('<div class="foo"></div><span class="foo"></div><p class="foo"></div>');
      const i = new Identifier('cl', 'foo');
      const i2 = new Identifier('tag', 'div');
      const r = new Rule([i, i2]);
      assert.deepEqual(r.locateElements(document), [el]);
    });

  });

});
