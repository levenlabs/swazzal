import Rule from './rule';
import Identifier from './identifier';
const _string_ = 'string';

export default function parse(str) {
  const idenStrings = str.split(';');
  const identifiers = [];
  let iParts = null;
  for (let i = 0; i < idenStrings.length; i++) {
    iParts = idenStrings[i].split('=', 2);
    if (typeof iParts[0] !== _string_ || typeof iParts[1] !== _string_) {
      continue;
    }
    identifiers.push(new Identifier(iParts[0], iParts[1]));
  }
  if (identifiers.length < 1) {
    return null;
  }
  return new Rule(identifiers);
}
