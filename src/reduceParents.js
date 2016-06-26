function containsPolyfill(parent, child) {
  function eq(i) {
    if (i === parent) {
      return true;
    }
    if (!i.parentNode) {
      return false;
    }
    return eq(i.parentNode);
  }
  try {
    return eq(child);
  } catch (e) {}
  return false;
}

function containsStd(parent, child) {
  return parent.contains(child);
}

const contains = (function() {
  if (typeof document === 'undefined') {
    return function() {
      return false;
    };
  }
  const e = document.createElement('div');
  if (typeof e.contains === 'function') {
    return containsStd;
  }
  return containsPolyfill;
}());

// if passed into reduce, it will reduce the array to only parents and remove
// any children of anything else in the array
export default function reduceParents(arr, el) {
  for (let i = 0; i < arr.length; i++) {
    // if our new element is a parent of another match then replace the child
    if (contains(el, arr[i])) {
      arr[i] = el;
      return arr;
    }
    // if our new element is a child of an existing element, then just ignore
    if (contains(arr[i], el)) {
      return arr;
    }
  }
  arr.push(el);
  return arr;
}
