import toArray from './toArray';
const getBoundingClientRect = 'getBoundingClientRect';

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
  return el && matchVal(el[prop], match);
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
    let prop = '';
    switch (this.property) {
      case 'ppid':
      case 'pid':
      case 'id':
        prop = 'id';
        break;
      case 'ppcl':
      case 'pcl':
      case 'cl':
        prop = 'className';
        break;
      case 'src':
        prop = 'src';
        break;
      case 'tag':
        prop = 'tagName';
        break;
      case 'w':
        if (el && typeof el[getBoundingClientRect] === 'function') {
          return el[getBoundingClientRect]().width === parseInt(this.value, 10);
        } else {
          prop = 'clientWidth';
        }
        break;
      case 'h':
        if (el && typeof el[getBoundingClientRect] === 'function') {
          return el[getBoundingClientRect]().height === parseInt(this.value, 10);
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
        if (matchProp(p, prop, this.value)) {
          return true;
        }
        if (parents) {
          return this.match(p);
        }
      }
      return false;
    }
    return matchProp(el, prop, this.value);
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
            if (typeof document.querySelectorAll === 'function') {
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
