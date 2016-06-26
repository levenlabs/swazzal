import Rule from './rule';
import Identifier from './identifier';

export default function parse(str) {
  if (typeof str !== 'string') {
    return null;
  }
  const idenStrings = str.split(';');
  const identifiers = [];
  let iParts = null;
  for (let i = 0; i < idenStrings.length; i++) {
    iParts = idenStrings[i].split('=');
    if (typeof iParts[0] !== 'string' || typeof iParts[1] !== 'string') {
      continue;
    }
    // we need to account for there possibly being an = in the value
    identifiers.push(new Identifier(iParts[0], iParts.slice(1, iParts.length).join('=')));
  }
  if (identifiers.length < 1) {
    return null;
  }
  return new Rule(identifiers);
}
