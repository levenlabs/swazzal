import toArray from './toArray';
const getBoundingClientRect = 'getBoundingClientRect';
const getComputedStyle = 'getComputedStyle';
const ownerDocument = 'ownerDocument';

function getDocument(el) {
  if (el && el[ownerDocument] && el[ownerDocument].nodeType === 9) {
    return el[ownerDocument];
  }
  let parent = el;
  // prevent it from infinite looping
  let i = 250;
  while (parent && parent.nodeType !== 9 && i-- > 0) {
    parent = parent.parentNode;
  }
  return parent || null;
}

function extractPath(href) {
  const a = document.createElement('a');
  // in older IE's they don't parse urls correctly without a scheme
  if (typeof href === 'string' && href.substr(0, 1) === '/') {
    // check to see if the href starts with // or if it has no scheme at all
    if (href.substr(0, 2) === '//') {
      a.href = 'http:' + href;
    } else {
      a.href = 'http://example.com' + href;
    }
  } else {
    a.href = href || '';
  }
  if (typeof a.pathname === 'string' && a.pathname.substr(0, 1) !== '/') {
    return '/' + a.pathname;
  }
  return a.pathname || '';
}

function matchVal(val, match) {
  if (typeof val !== 'string') {
    if (typeof val === 'number') {
      return val === parseInt(match, 10);
    }
    return false;
  }
  if (match.substr(0, 1) === '~') {
    return val.toLowerCase().indexOf(match.substr(1).toLowerCase()) > -1;
  }
  return val.toLowerCase() === match.toLowerCase();
}

function matchProp(el, prop, match) {
  // getAttribute is an "object" in <IE8
  if (!el || typeof el.getAttribute === 'undefined') {
    return false;
  }
  // class is special since its multiple values joined with space
  // we need to use getAttribute instead of standard el[prop] because of svg
  // but IE doesn't support getting class with getAttribute so we fallback to
  // className
  if (prop === 'class') {
    const val = (el.getAttribute(prop) || el.className || '');
    if (typeof val !== 'string') {
      return false;
    }
    const vals = val.split(' ');
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] && matchVal(vals[i], match)) {
        return true;
      }
    }
    return false;
  // we want to treat url matches starting with / as special path-only matches
  } else if ((prop === 'src' || prop === 'href') && match.substr(0, 1) === '/') {
    return matchVal(extractPath(el.getAttribute(prop) || el[prop] || ''), match);
  }
  return matchVal(el[prop], match);
}

function getStyle(el) {
  if (!el || el.nodeType !== 1) {
    return {};
  }
  if (typeof window[getComputedStyle] === 'function') {
    return window[getComputedStyle](el, null);
  }
  if (typeof el.currentStyle !== 'undefined') {
    return el.currentStyle;
  }
  return el.style;
}

function matchVisible(el, match) {
  const style = getStyle(el);
  return (style.display !== 'none' && style.visibility !== 'hidden') === !!match;
}

function trimPx(str) {
  const i = str.lastIndexOf('px');
  if (i > -1) {
    return str.substring(0, i);
  }
  return str;
}

export default class Identifier {
  constructor(property, value) {
    this.property = property || '';
    if (typeof this.property !== 'string') {
      throw new Error('invalid property passed to Identifier');
    }
    this.value = value || '';
    if (typeof this.value !== 'string') {
      throw new Error('invalid value passed to Identifier');
    }
    this.wildcard = this.value.substr(0, 1) === '~';
  }

  encode() {
    return [this.property, this.value].join('=');
  }

  match(el) {
    const value = this.value;
    let parents = this.property.substr(0, 2) === 'pp';
    let parent = this.property.substr(0, 1) === 'p' && !parents;
    let positiveCheck = true;
    function propFn(prop) {
      return function(el) {
        return matchProp(el, prop, value);
      }
    }
    let fn = null;
    if (!el) {
      return false;
    }
    switch (this.property) {
      case 'ppid':
      case 'pid':
      case 'id':
        fn = propFn('id');
        break;
      case 'ppcl':
      case 'pcl':
      case 'cl':
        fn = propFn('class');
        break;
      case 'src':
        fn = propFn('src');
        break;
      case 'pptag':
      case 'ptag':
      case 'tag':
        fn = propFn('tagName');
        break;
      case 'w':
        if (el && typeof el[getBoundingClientRect] === 'function') {
          return el[getBoundingClientRect]().width === parseInt(trimPx(value), 10);
        } else {
          fn = propFn('clientWidth');
        }
        break;
      case 'h':
        if (el && typeof el[getBoundingClientRect] === 'function') {
          return el[getBoundingClientRect]().height === parseInt(trimPx(value), 10);
        } else {
          fn = propFn('clientHeight');
        }
        break;
      case 'vis':
        fn = function(el) {
          return matchVisible(el, value == 'true');
        };
        // visiblity requires all of the parents and el to be visible
        // invsibility requires 1 parent or el to be invisible
        positiveCheck = value != 'true';
        // check el
        // if value is false, then we want to verify that we're not visible
        // if value is true, then we want to verify that we're visible
        if (positiveCheck === fn(el)) {
          return positiveCheck;
        }
        // if we want to know if the element is visible, it's not enough to check this element
        // we have to ensure the parents are too
        parents = true;
        break;
      default:
        return false;
    }
    if (parents || parent) {
      let last = el;
      let p = null;
      while ((p = last && last.parentElement) && p !== last) {
        const res = fn(p);
        // if res is true and positiveCheck is true
        // or res is false and positiveCheck is false
        if (res === positiveCheck) {
          return res;
        }
        // stop after one parent if we're not looking for multiple parents
        if (!parents) {
          break;
        }
        last = p;
      }
      return !positiveCheck;
    }
    return fn(el);
  }

  roots(parent) {
    let fnName = '';
    const doc = parent ? (getDocument(parent) || document) : null;
    if (!doc) {
      return [];
    }
    switch (this.property) {
      case 'ppid':
      case 'pid':
      case 'id':
        if (!this.wildcard) {
          const el = doc.getElementById(this.value);
          if (el) {
            return [el];
          }
        }
        break;
      case 'ppcl':
      case 'pcl':
      case 'cl':
        if (!this.wildcard) {
          fnName = 'getElementsByClassName';
          if (typeof parent[fnName] !== 'function') {
            // querySelectorAll is "object" in <IE8
            if (typeof doc.querySelectorAll !== 'undefined') {
              return toArray(doc.querySelectorAll('.' + this.value));
            }
            return [parent];
          }
        }
        break;
      case 'pptag':
      case 'ptag':
      case 'tag':
        if (!this.wildcard) {
          fnName = 'getElementsByTagName';
        }
        break;
      // todo: for w/h we should find the children of doc that are larger than w/h
    }
    if (fnName) {
      return toArray(parent[fnName](this.value));
    }
    return [parent];
  }
}
