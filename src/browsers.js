import './polyfills';
import Rule from './rule';
import Identifier from './identifier';
import parse from './parse';
import reduceParents from './reduceParents';

// note: we cannot use export above without breaking IE8

export {
  Rule,
  Identifier,
  parse,
  reduceParents
};
