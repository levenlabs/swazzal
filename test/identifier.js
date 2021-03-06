/* eslint-env node, mocha */
import { assert } from 'assertive-chai';
import { Identifier } from '../src/browsers';

describe('Identifier', function() {

  describe('Identifier()', function () {

    it('Identifier("id") should set property to id', function () {
      const r = new Identifier('id');
      assert.equal(r.property, 'id');
      assert.equal(r.value, '');
    });

    it('Identifier("id", "foo") should set property to id and value "foo"', function () {
      const i = new Identifier('id', 'foo');
      assert.equal(i.property, 'id');
      assert.equal(i.value, 'foo');
    });

    it('Identifier(1) should throw', function () {
      assert.throws(() => new Identifier(1), 'invalid property passed to Identifier');
    });

    it('Identifier("id", 1) should throw', function () {
      assert.throws(() => new Identifier('id', 1), 'invalid value passed to Identifier');
    });

  });

  describe('encode()', function () {

    it('should return a string separated by =', function () {
      const i = new Identifier('name', 'value');
      assert.equal('name=value', i.encode());
    });

  });

  describe('roots()', function () {

    it('roots for id=bar should return the parent with id bar', function () {
      const i = new Identifier('id', 'bar');
      const div = makeElement('<div id="bar"></div>');
      assert.deepEqual(i.roots(document), [div]);
    });

    // only run these tests in ie8+
    if (typeof document.querySelectorAll !== 'undefined') {
      it('roots for cl=bar should return the parent with class bar', function () {
        const i = new Identifier('cl', 'bar');
        const div = makeElement('<div class="bar"></div>');
        assert.deepEqual(i.roots(document), [div]);
      });
    }

    it('roots for id=test of an iframe should return the iframe document', function (done) {
      makeElement('<p id="test"></p>');
      const iframe = document.createElement('iframe');
      iframe.src = '/base/test.html';
      iframe.id = 'ifame';
      const i = new Identifier('id', 'test');
      function onload() {
        const doc = (iframe.contentDocument || iframe.contentWindow.document);
        assert.deepEqual(i.roots(doc.body), [doc.getElementById('test')]);
        done();
      };
      if (iframe.attachEvent) {
        iframe.attachEvent('onload', onload, false);
      } else {
        iframe.onload = onload;
      }
      document.body.appendChild(iframe);
    });

    it('roots for id=bar with no el document should return [el]', function () {
      const el = document.createElement('div');
      el.id = 'bar';
      const i = new Identifier('id', 'bar');
      assert.deepEqual(i.roots(el), [el]);
    });

    it('roots for null return []', function () {
      const i = new Identifier('id', 'bar');
      assert.deepEqual(i.roots(null), []);
    });

  });

  describe('match()', function () {

    /* //////////////////////////////////////////////////
    ID
    ////////////////////////////////////////////////// */

    describe('id', function () {

      it('id=foo should match an element with id "foo"', function () {
        const i = new Identifier('id', 'foo');
        const p = makeElement('<p id="foo"></p>');
        assert.isTrue(i.match(p));
      });

      it('id=foo should not match an element with class "foo"', function () {
        const i = new Identifier('id', 'foo');
        const p = makeElement('<p class="foo"></p>');
        assert.isFalse(i.match(p));
      });

      it('id=foo should not match an element with id "foobar"', function () {
        const i = new Identifier('id', 'foo');
        const p = makeElement('<p id="foobar"></p>');
        assert.isFalse(i.match(p));
      });

      it('id=~foo should match an element with id "foobar"', function () {
        const i = new Identifier('id', '~foo');
        const p = makeElement('<p id="foobar"></p>');
        assert.isTrue(i.match(p));
      });

      it('id=~foo should match an element with id "foo"', function () {
        const i = new Identifier('id', '~foo');
        const p = makeElement('<p id="foo"></p>');
        assert.isTrue(i.match(p));
      });

      it('id=~foo should not match an element with id "bar"', function () {
        const i = new Identifier('id', '~foo');
        const p = makeElement('<p id="bar"></p>');
        assert.isFalse(i.match(p));
      });

    });

    /* //////////////////////////////////////////////////
    PID
    ////////////////////////////////////////////////// */

    describe('pid', function () {

      it('pid=foo should match an element with a parent with id "foo"', function () {
        const i = new Identifier('pid', 'foo');
        const span = makeElement('<p id="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pid=foo should not match an element with a parent with id "foobar"', function () {
        const i = new Identifier('pid', 'foo');
        const span = makeElement('<p id="foobar"><span id="bar"></span></p>', 'bar');
        assert.isFalse(i.match(span));
      });

      it('pid=foo should not match an element with an with id "foo"', function () {
        const i = new Identifier('pid', 'foo');
        const p = makeElement('<p id="foo"></p>');
        assert.isFalse(i.match(p));
      });

      it('pid=~foo should match an element with a parent with id "foobar"', function () {
        const i = new Identifier('pid', '~foo');
        const span = makeElement('<p id="foobar"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pid=~foo should match an element with a parent with id "foo"', function () {
        const i = new Identifier('pid', '~foo');
        const span = makeElement('<p id="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pid=~foo should not match an element with a parent with id "bar"', function () {
        const i = new Identifier('pid', '~foo');
        const span = makeElement('<p id="bar"><span id="foo"></span></p>', 'foo');
        assert.isFalse(i.match(span));
      });

      it('pid=~foo should not match an element with a parents parent with id "foo"', function () {
        const i = new Identifier('pid', '~foo');
        const span = makeElement('<div id="foo"><p><span id="bar"></span></p></div>', 'bar');
        assert.isFalse(i.match(span));
      });

      it('pid=~bar should not match an element with a child with id "bar"', function () {
        const i = new Identifier('pid', '~bar');
        const div = makeElement('<div id="foo"><span id="bar"></span></div>', 'foo');
        assert.isFalse(i.match(div));
      });

      it('pid=foo should not break on document', function () {
        const i = new Identifier('pid', 'foo');
        assert.isFalse(i.match(document));
      });

    });

    /* //////////////////////////////////////////////////
    PPID
    ////////////////////////////////////////////////// */

    describe('ppid', function () {

      it('ppid=foo should match an element with a parent with id "foo"', function () {
        const i = new Identifier('ppid', 'foo');
        const span = makeElement('<p id="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppid=foo should match an element with a parents parent with id "foo"', function () {
        const i = new Identifier('ppid', 'foo');
        const span = makeElement('<div id="foo"><p><span id="bar"></span></p></div>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppid=foo should not match an element with a parent with id "foobar"', function () {
        const i = new Identifier('ppid', 'foo');
        const span = makeElement('<p id="foobar"><span id="bar"></span></p>', 'bar');
        assert.isFalse(i.match(span));
      });

      it('ppid=foo should not match an element with an with id "foo"', function () {
        const i = new Identifier('ppid', 'foo');
        const p = makeElement('<p id="foo"></p>');
        assert.isFalse(i.match(p));
      });

      it('ppid=~foo should match an element with a parent with id "foobar"', function () {
        const i = new Identifier('ppid', '~foo');
        const span = makeElement('<p id="foobar"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppid=~foo should match an element with a parent with id "foo"', function () {
        const i = new Identifier('ppid', '~foo');
        const span = makeElement('<p id="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppid=~foo should match an element with a parents parent with id "foobar"', function () {
        const i = new Identifier('ppid', '~foo');
        const span = makeElement('<div id="foobar"><p><span id="bar"></span></p></div>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppid=~foo should not match an element with a parent with id "bar"', function () {
        const i = new Identifier('ppid', '~foo');
        const span = makeElement('<p id="bar"><span id="foo"></span></p>', 'foo');
        assert.isFalse(i.match(span));
      });

      it('ppid=~bar should not match an element with a child with id "bar"', function () {
        const i = new Identifier('ppid', '~bar');
        const div = makeElement('<div id="foo"><span id="bar"></span></div>', 'foo');
        assert.isFalse(i.match(div));
      });

      it('ppid=foo should not infinite loop on document', function () {
        const i = new Identifier('ppid', 'foo');
        assert.isFalse(i.match(document));
      });

    });

    /* //////////////////////////////////////////////////
    CL
    ////////////////////////////////////////////////// */

    describe('cl', function () {

      it('cl=foo should match an element with class "foo"', function () {
        const i = new Identifier('cl', 'foo');
        const p = makeElement('<p class="foo"></p>');
        assert.isTrue(i.match(p));
      });

      it('cl=foo should match an element with class "foo bar"', function () {
        const i = new Identifier('cl', 'foo');
        const p = makeElement('<p class="foo bar"></p>');
        assert.isTrue(i.match(p));
      });

      it('cl=foo should match an element with class "bar foo"', function () {
        const i = new Identifier('cl', 'foo');
        const p = makeElement('<p class="bar foo"></p>');
        assert.isTrue(i.match(p));
      });

      it('id=foo should not match an element with id "foo"', function () {
        const i = new Identifier('cl', 'foo');
        const p = makeElement('<p id="foo"></p>');
        assert.isFalse(i.match(p));
      });

      it('cl=foo should not match an element with class "foobar"', function () {
        const i = new Identifier('cl', 'foo');
        const p = makeElement('<p class="foobar"></p>');
        assert.isFalse(i.match(p));
      });

      it('cl=~foo should match an element with class "foobar"', function () {
        const i = new Identifier('cl', '~foo');
        const p = makeElement('<p class="foobar"></p>');
        assert.isTrue(i.match(p));
      });

      it('cl=~foo should match an element with class "foo bar"', function () {
        const i = new Identifier('cl', '~foo');
        const p = makeElement('<p class="foo bar"></p>');
        assert.isTrue(i.match(p));
      });

      it('cl=~foo should match an element with class "foo"', function () {
        const i = new Identifier('cl', '~foo');
        const p = makeElement('<p class="foo"></p>');
        assert.isTrue(i.match(p));
      });

      it('cl=~foo should not match an element with class "bar"', function () {
        const i = new Identifier('cl', '~foo');
        const p = makeElement('<p class="bar"></p>');
        assert.isFalse(i.match(p));
      });

      it('cl=foo should match an svg element with class "foo bar"', function () {
        const i = new Identifier('cl', 'foo');
        const svg = makeElement('<svg version="1.1" width="100" height="100" xmlns="http://www.w3.org/2000/svg" class="foo bar"><circle cx="10" cy="10" r="10" /></svg>');
        // only test if svg's are supported
        if (svg) {
          assert.isTrue(i.match(svg));
        }
      });

      it('cl=~foo should match an svg element with class "foobar"', function () {
        const i = new Identifier('cl', '~foo');
        const svg = makeElement('<svg version="1.1" width="100" height="100" xmlns="http://www.w3.org/2000/svg" class="foobar"><circle cx="10" cy="10" r="10" /></svg>');
        // only test if svg's are supported
        if (svg) {
          assert.isTrue(i.match(svg));
        }
      });

    });

    /* //////////////////////////////////////////////////
    PCL
    ////////////////////////////////////////////////// */

    describe('pcl', function () {

      it('pcl=foo should match an element with a parent with class "foo"', function () {
        const i = new Identifier('pcl', 'foo');
        const span = makeElement('<p class="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pcl=foo should not match an element with a parent with class "foobar"', function () {
        const i = new Identifier('pcl', 'foo');
        const span = makeElement('<p class="foobar"><span id="bar"></span></p>', 'bar');
        assert.isFalse(i.match(span));
      });


      it('pcl=foo should not match an element with an with class "foo"', function () {
        const i = new Identifier('pcl', 'foo');
        const p = makeElement('<p class="foo"></p>');
        assert.isFalse(i.match(p));
      });

      it('pcl=~foo should match an element with a parent with class "foobar"', function () {
        const i = new Identifier('pcl', '~foo');
        const span = makeElement('<p class="foobar"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pcl=~foo should match an element with a parent with class "foo"', function () {
        const i = new Identifier('pcl', '~foo');
        const span = makeElement('<p class="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pcl=~foo should not match an element with a parent with class "bar"', function () {
        const i = new Identifier('pcl', '~foo');
        const span = makeElement('<p class="bar"><span id="baz"></span></p>', 'baz');
        assert.isFalse(i.match(span));
      });

      it('pcl=~foo should not match an element with a parents parent with class "foo"', function () {
        const i = new Identifier('pcl', '~foo');
        const span = makeElement('<div class="foo"><p><span id="baz"></span></p></div>', 'baz');
        assert.isFalse(i.match(span));
      });

      it('pcl=~bar should not match an element with a child with class "bar"', function () {
        const i = new Identifier('pcl', '~bar');
        const div = makeElement('<div id="foo"><span class="bar"></span></div>', 'foo');
        assert.isFalse(i.match(div));
      });

      it('pcl=foo should not break on document', function () {
        const i = new Identifier('pcl', 'foo');
        assert.isFalse(i.match(document));
      });

    });

    /* //////////////////////////////////////////////////
    PPCL
    ////////////////////////////////////////////////// */

    describe('ppcl', function () {

      it('ppcl=foo should match an element with a parent with class "foo"', function () {
        const i = new Identifier('ppcl', 'foo');
        const span = makeElement('<p class="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppcl=foo should match an element with a parents parent with class "foo"', function () {
        const i = new Identifier('ppcl', 'foo');
        const span = makeElement('<div class="foo"><p><span id="bar"></span></p></div>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppcl=foo should not match an element with a parent with class "foobar"', function () {
        const i = new Identifier('ppcl', 'foo');
        const span = makeElement('<p class="foobar"><span id="bar"></span></p>', 'bar');
        assert.isFalse(i.match(span));
      });

      it('ppcl=foo should not match an element with an with class "foo"', function () {
        const i = new Identifier('ppcl', 'foo');
        const p = makeElement('<p class="foo"></p>');
        assert.isFalse(i.match(p));
      });

      it('ppcl=~foo should match an element with a parent with class "foobar"', function () {
        const i = new Identifier('ppcl', '~foo');
        const span = makeElement('<p class="foobar"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppcl=~foo should match an element with a parent with class "foo"', function () {
        const i = new Identifier('ppcl', '~foo');
        const span = makeElement('<p class="foo"><span id="bar"></span></p>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppcl=~foo should match an element with a parents parent with class "foobar"', function () {
        const i = new Identifier('ppcl', '~foo');
        const span = makeElement('<div class="foobar"><p><span id="bar"></span></p></div>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('ppcl=~foo should not match an element with a parent with class "bar"', function () {
        const i = new Identifier('ppcl', '~foo');
        const span = makeElement('<p class="bar"><span id="foo"></span></p>', 'foo');
        assert.isFalse(i.match(span));
      });

      it('ppcl=~bar should not match an element with a child with class "bar"', function () {
        const i = new Identifier('ppcl', '~bar');
        const div = makeElement('<div id="foo"><span class="bar"></span></div>', 'foo');
        assert.isFalse(i.match(div));
      });

      it('ppcl=foo should not infinite loop on document', function () {
        const i = new Identifier('ppcl', 'foo');
        assert.isFalse(i.match(document));
      });

    });

    /* //////////////////////////////////////////////////
    SRC
    ////////////////////////////////////////////////// */

    describe('src', function () {

      it('src=/base/foo.html should match an element with a src of "/base/foo.html"', function () {
        const i = new Identifier('src', '/base/foo.html');
        const iframe = makeElement('<iframe src="/base/foo.html"></iframe>');
        assert.isTrue(i.match(iframe));
      });

      it('src=/base/foo.html should match an element with a src of "//localhost:9876/base/foo.html"', function () {
        const i = new Identifier('src', '/base/foo.html');
        const iframe = makeElement('<iframe src="//localhost:9876/base/foo.html"></iframe>');
        assert.isTrue(i.match(iframe));
      });

      it('src=/base/foo.html should match an element with a src of "http://localhost:9876/base/foo.html"', function () {
        const i = new Identifier('src', '/base/foo.html');
        const iframe = makeElement('<iframe src="http://localhost:9876/base/foo.html"></iframe>');
        assert.isTrue(i.match(iframe));
      });

      it('src=/foo should not match an element with a src of "/base/foo.html"', function () {
        const i = new Identifier('src', '/foo');
        const iframe = makeElement('<iframe src="/base/foo.html"></iframe>');
        assert.isFalse(i.match(iframe));
      });

      it('src=/base/foo.html should not an element with a src of "about:blank"', function () {
        const i = new Identifier('src', '/base/foo.html');
        const iframe = makeElement('<iframe src="about:blank"></iframe>');
        assert.isFalse(i.match(iframe));
      });

      // detect ie9 and above
      // in ie8 we cannot use data uri's in iframes
      if (typeof Array.prototype.reduce === 'function') {
        it('src=/base/foo.html should not an element with a src of "data:text..."', function () {
          const i = new Identifier('src', '/base/foo.html');
          const iframe = makeElement('<iframe src="data:text/html;charset=utf-8,%3Chtml%3E%3Cbody%20style%3D%27background%3Atransparent%27%3E%3C%2Fbody%3E%3C%2Fhtml%3E"></iframe>');
          assert.isFalse(i.match(iframe));
        });

        it('src=~data: should an element with a src of "data:text..."', function () {
          const i = new Identifier('src', '~data:');
          const iframe = makeElement('<iframe src="data:text/html;charset=utf-8,%3Chtml%3E%3Cbody%20style%3D%27background%3Atransparent%27%3E%3C%2Fbody%3E%3C%2Fhtml%3E"></iframe>');
          assert.isTrue(i.match(iframe));
        });
      }

      it('src=/base/foo.html should match an element with a src of "/base/foo.html?bar"', function () {
        const i = new Identifier('src', '/base/foo.html');
        const iframe = makeElement('<iframe src="/base/foo.html?bar"></iframe>');
        assert.isTrue(i.match(iframe));
      });

      it('src=/foo.html should not match an element with a src of "/base/foo.html?bar"', function () {
        const i = new Identifier('src', '/foo.html');
        const iframe = makeElement('<iframe src="/base/foo.html?bar"></iframe>');
        assert.isFalse(i.match(iframe));
      });

      it('src=bar should not match an element with a src of "/base/bar.html"', function () {
        const i = new Identifier('src', 'bar');
        const iframe = makeElement('<iframe src="/base/bar.html"></iframe>');
        assert.isFalse(i.match(iframe));
      });

      it('src=~foo should match an element with a src of "/base/foo.html"', function () {
        const i = new Identifier('src', '~foo');
        const iframe = makeElement('<iframe src="/base/foo.html"></iframe>');
        assert.isTrue(i.match(iframe));
      });

      it('src=~foo should not match an element with a src of "/base/bar.html"', function () {
        const i = new Identifier('src', '~foo');
        const iframe = makeElement('<iframe src="/base/bar.html"></iframe>');
        assert.isFalse(i.match(iframe));
      });

    });

    /* //////////////////////////////////////////////////
    W
    ////////////////////////////////////////////////// */

    describe('w', function () {

      it('w=100 should match an element with a width of 100px', function () {
        const i = new Identifier('w', '100');
        const div = makeElement('<div style="width: 100px; height: 1px; display: block;"></div>');
        assert.isTrue(i.match(div));
      });

      it('w=100px should match an element with a width of 100px', function () {
        const i = new Identifier('w', '100px');
        const div = makeElement('<div style="width: 100px; height: 1px; display: block;"></div>');
        assert.isTrue(i.match(div));
      });

      it('w=100 should not match an element with a width of 101px', function () {
        const i = new Identifier('w', '100');
        const div = makeElement('<div style="width: 101px; height: 1px; display: block;"></div>');
        assert.isFalse(i.match(div));
      });

      it('w=100 should not match an element with a height of 100px', function () {
        const i = new Identifier('w', '100');
        const div = makeElement('<div style="height: 100px; width: 1px; display: block;"></div>');
        assert.isFalse(i.match(div));
      });

    });

    /* //////////////////////////////////////////////////
    H
    ////////////////////////////////////////////////// */

    describe('h', function () {

      it('h=100 should match an element with a height of 100px', function () {
        const i = new Identifier('h', '100');
        const div = makeElement('<div style="height: 100px; width: 1px; display: block;"></div>');
        assert.isTrue(i.match(div));
      });

      it('h=100px should match an element with a height of 100px', function () {
        const i = new Identifier('h', '100px');
        const div = makeElement('<div style="height: 100px; width: 1px; display: block;"></div>');
        assert.isTrue(i.match(div));
      });

      it('h=100 should not match an element with a height of 101px', function () {
        const i = new Identifier('h', '100');
        const div = makeElement('<div style="height: 101px; width: 1px; display: block;"></div>');
        assert.isFalse(i.match(div));
      });

      it('h=100 should not match an element with a width of 100px', function () {
        const i = new Identifier('h', '100');
        const div = makeElement('<div style="width: 100px; height: 1px; display: block;"></div>');
        assert.isFalse(i.match(div));
      });

    });

    /* //////////////////////////////////////////////////
    TAG
    ////////////////////////////////////////////////// */

    describe('tag', function () {

      it('tag=div should match a div', function () {
        const i = new Identifier('tag', 'div');
        const div = makeElement('<div></div>');
        assert.isTrue(i.match(div));
      });

      it('tag=div should not match a span', function () {
        const i = new Identifier('tag', 'div');
        const span = makeElement('<span></span>');
        assert.isFalse(i.match(span));
      });

      it('tag=~div should match a div', function () {
        const i = new Identifier('tag', '~div');
        const div = makeElement('<div></div>');
        assert.isTrue(i.match(div));
      });

    });

    /* //////////////////////////////////////////////////
    PTAG
    ////////////////////////////////////////////////// */

    describe('ptag', function () {

      it('ptag=div should match a p inside of a div', function () {
        const i = new Identifier('ptag', 'div');
        const p = makeElement('<div><p id="bar"></p></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('ptag=body should match a div in body', function () {
        const i = new Identifier('ptag', 'body');
        const div = makeElement('<div></div>', '');
        assert.isTrue(i.match(div));
      });

      it('ptag=div should not match a div with no div parent', function () {
        const i = new Identifier('ptag', 'div');
        const div = makeElement('<div></div>');
        assert.isFalse(i.match(div));
      });

      it('ptag=span should not match a div wrapping a p', function () {
        const i = new Identifier('ptag', 'span');
        const p = makeElement('<div><p id="bar"></p></div>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('ptag=div should not match a p wrapping a div', function () {
        const i = new Identifier('ptag', 'div');
        const p = makeElement('<p><div id="bar"></div></p>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('ptag=div should not match div that is 2 parents up', function () {
        const i = new Identifier('ptag', 'div');
        const span = makeElement('<div><p><span id="bar"></span></p></div>', 'bar');
        assert.isFalse(i.match(span));
      });

      it('ptag=div should not break on document', function () {
        const i = new Identifier('ptag', 'div');
        assert.isFalse(i.match(document));
      });

    });

    /* //////////////////////////////////////////////////
    PPTAG
    ////////////////////////////////////////////////// */

    describe('pptag', function () {

      it('pptag=div should match a p inside of a div', function () {
        const i = new Identifier('pptag', 'div');
        const p = makeElement('<div><p id="bar"></p></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('pptag=div should match a span inside of a p inside of a div', function () {
        const i = new Identifier('pptag', 'div');
        const span = makeElement('<div><p><span id="bar"></span></p></div>', 'bar');
        assert.isTrue(i.match(span));
      });

      it('pptag=body should match a div in body', function () {
        const i = new Identifier('pptag', 'body');
        const div = makeElement('<div></div>', '');
        assert.isTrue(i.match(div));
      });

      it('pptag=div should not match a div with no parent', function () {
        const i = new Identifier('pptag', 'div');
        const div = makeElement('<div></div>');
        assert.isFalse(i.match(div));
      });

      it('pptag=span should not match a div wrapping a p', function () {
        const i = new Identifier('pptag', 'span');
        const p = makeElement('<div><p id="bar"></p></div>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('pptag=div should not match a p wrapping a div', function () {
        const i = new Identifier('pptag', 'div');
        const p = makeElement('<p><div id="bar"></div></p>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('pptag=div should not break on document', function () {
        const i = new Identifier('pptag', 'div');
        assert.isFalse(i.match(document));
      });

    });

    /* //////////////////////////////////////////////////
    VIS
    ////////////////////////////////////////////////// */

    describe('vis', function () {

      it('vis=true should match a visible div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div></div>', '');
        assert.isTrue(i.match(p));
      });

      it('vis=false should match a display:none div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="display: none"></div>', '');
        assert.isTrue(i.match(p));
      });

      it('vis=true should not match a display:none div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div style="display: none"></div>', '');
        assert.isFalse(i.match(p));
      });

      it('vis=false should not match a display:block div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="display: block"></div>', '');
        assert.isFalse(i.match(p));
      });

      it('vis=false should match a visibility:hidden div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="visibility: hidden"></div>', '');
        assert.isTrue(i.match(p));
      });

      it('vis=false should match a parent display:none div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="display: none"><div id="bar"></div></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('vis=false should match a parent visibility:hidden div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="visibility: hidden"><div id="bar"></div></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('vis=true should not match a parent display:none div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div style="display: none"><div id="bar"></div></div>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('vis=true should not match a parent visibility:hidden div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div style="visibility: hidden"><div id="bar"></div></div>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('vis=false should match a parents display:none div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="display: none"><div style="display: block"><div id="bar"></div></div></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('vis=false should match a parents visibility:hidden div', function () {
        const i = new Identifier('vis', 'false');
        const p = makeElement('<div style="visibility: hidden"><div style="display: block"><div id="bar"></div></div></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('vis=true should not match a parents display:none div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div style="display: none"><div style="display: block"><div id="bar"></div></div></div>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('vis=true should not match a parents visibility:hidden div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div style="visibility: hidden"><div style="display: block"><div id="bar"></div></div></div>', 'bar');
        assert.isFalse(i.match(p));
      });

      it('vis=true should match a parents display:block div', function () {
        const i = new Identifier('vis', 'true');
        const p = makeElement('<div style="display: block"><div><div id="bar"></div></div></div>', 'bar');
        assert.isTrue(i.match(p));
      });

      it('vis=true should not break on document', function () {
        const i = new Identifier('vis', 'true');
        assert.isTrue(i.match(document));
      });

    });

  });

});
