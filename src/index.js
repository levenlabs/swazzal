import './polyfills';
import Rule from './rule';
import Identifier from './identifier';
import parse from './parse';

// note: we cannot use export here without breaking IE8

export {
  Rule,
  Identifier,
  parse
};
