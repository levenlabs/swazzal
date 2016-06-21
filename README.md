# swazzal #

Swazzal is a small library for identifying elements on the DOM using
identifiers. A collection of identifiers is called a rule.

## Supported Identifers ##

* `tag`: matches the tagName of the element
* `cl`: matches a class on the element
* `pcl`: matches a class on the direct parent
* `ppcl`: matches a class on any of the parents
* `id`: matches the id of the element
* `pid`: matches the id of the direct parent
* `ppid`: matches the id of any of the parents
* `w`: matches the width of the element
* `h`: matches the height of the element

## Parsing Rules ##

The supported rule syntax is:

    {name}={value};{name2}={value2}

Any number of identifiers can be combined and all must match for an element to
be chosen for that rule. The `parse` method returns a `Rule` instance that
can be used for finding elements.

In order to parse such a string, the exported `parse` function can be used.

    import { parse } from 'swazzal';
    // or const parse = require('swazzal').parse;
    const rule = parse('id=foo');

## Locating Elements ##

    import { Identifier, Rule } from 'swazzal';
    // or const Identifier = require('swazzal').Identifier;
    // or const Rule = require('swazzal').Rule;
    const id = new Identifier('id', 'foo');
    const rule = new Rule([id]);
    rule.locateElements(document);

`locateElements` will return an array of the top-most element matches for that
rule under the given parent. In the example above, `document` was given to
search the whole document, but any element can be passed to restrict searches.

## Matching Elements ##

    const el = document.createElement('div');
    el.id = foo;
    rule.match(el);

You can also match specific elements to a rule.


## Supported Browsers ##

Automated testing for Chrome, Firefox, IE6+, Safari is provided via
[BrowserStack](https://www.browserstack.com/).
