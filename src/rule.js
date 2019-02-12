import unique from './arrayUnique';
import reduceParents from './reduceParents';

function locateElements(rule, parent, includeAll) {
  const roots = rule.locateRoots(parent);
  const matchChildren = (children) => {
    if (!children) {
      return [];
    }
    const matches = [];
    for (let i = 0; i < children.length; i++) {
      // if its not an element, skip it
      // apparently children includes nodes in <IE9
      if (children[i].nodeType !== 1) {
        continue;
      }
      // if this child matches don't search it's children
      // unless includeAll is true
      if (rule.match(children[i])) {
        matches.push(children[i]);
        if (!includeAll) {
          continue;
        }
      }
      // search the children for matches
      matches.push(...matchChildren(children[i].children));
    }
    return matches;
  };

  // first we loop over the roots
  return unique(roots.reduce((els, root) => {
    const rootMatch = rule.match(root);
    if (rootMatch) {
      els.push(root);
    }
    // if the root matches don't search the children
    // unless includeAll is true
    if (!rootMatch || includeAll) {
      els.push(...matchChildren(root.children));
    }
    return els;
  }, []));
}

export default class Rule {
  constructor(identifiers) {
    this.identifiers = identifiers || [];
  }

  encode() {
    return this.identifiers.map(i => i.encode()).join(';');
  }

  locateRoots(parent) {
    if (!parent) {
      return [];
    }
    // build an array of all the possible roots from the identifiers
    // todo: a better way of doing this would be to only take roots that are
    // returned from ALL the identifiers
    let parentElement = parent;
    if (parent.nodeType === 9) {
      parentElement = parent.documentElement;
    }
    const roots = unique(this.identifiers.reduce((r, i) => r.concat(i.roots(parentElement)), []));
    // if any of the roots are parents of another, we remove non parents
    return roots.reduce(reduceParents, []);
  }

  match(el) {
    for (let i = 0; i < this.identifiers.length; i++) {
      if (!this.identifiers[i].match(el)) {
        return false;
      }
    }
    return true;
  }

  // Note: this ONLY returns the highest parent match
  locateElements(parent) {
    return locateElements(this, parent, false);
  }

  // Note: this returns ALL elements that match
  locateAllElements(parent) {
    return locateElements(this, parent, true);
  }
}
