import toArray from './toArray';
const getBoundingClientRect = 'getBoundingClientRect';

function extractPath(href) {
  const a = document.createElement('a');
  a.href = href || '';
  // in older IE's they don't parse urls correctly without a scheme
  if (a.pathname === '' && typeof href === 'string' && href.substr(0, 1) === '/') {
    // check to see if the href starts with // or if it has no scheme at all
    if (href.substr(0, 2) === '//') {
      a.href = 'http:' + href;
    } else {
      a.href = 'http://example.com' + href;
    }
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
    const parents = this.property.substr(0, 2) === 'pp';
    const parent = this.property.substr(0, 1) === 'p' && !parents;
    const value = this.value;
    let prop = '';
    if (!el) {
      return false;
    }
    switch (this.property) {
      case 'ppid':
      case 'pid':
      case 'id':
        prop = 'id';
        break;
      case 'ppcl':
      case 'pcl':
      case 'cl':
        prop = 'class';
        break;
      case 'src':
        prop = 'src';
        break;
      case 'tag':
        prop = 'tagName';
        break;
      case 'w':
        if (el && typeof el[getBoundingClientRect] === 'function') {
          return el[getBoundingClientRect]().width === parseInt(trimPx(value), 10);
        } else {
          prop = 'clientWidth';
        }
        break;
      case 'h':
        if (el && typeof el[getBoundingClientRect] === 'function') {
          return el[getBoundingClientRect]().height === parseInt(trimPx(value), 10);
        } else {
          prop = 'clientHeight';
        }
        break;
      default:
        return false;
    }
    if (parents || parent) {
      const p = el && el.parentElement;
      if (p && p !== el) {
        if (matchProp(p, prop, value)) {
          return true;
        }
        if (parents) {
          return this.match(p);
        }
      }
      return false;
    }
    return matchProp(el, prop, value);
  }

  roots(parent) {
    let fnName = '';
    switch (this.property) {
      case 'ppid':
      case 'pid':
      case 'id':
        if (!this.wildcard) {
          const el = document.getElementById(this.value);
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
            if (typeof document.querySelectorAll !== 'undefined') {
              return toArray(document.querySelectorAll('.' + this.value));
            }
            return [parent];
          }
        }
        break;
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
