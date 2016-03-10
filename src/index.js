import ElementCollection from './element'
import InstanceCollection from './instance'
import commonPrototype from './common';
import warning from 'warning';
import { compile,  selector, registerPseudo } from 'bill';
import { createNode, NODE_TYPES } from 'bill/node';
import { qsa, matches } from './utils';

import * as utils from './utils';

let $ = NodeCollection;

function NodeCollection(elements) {
  let first = [].concat(elements).filter(e => !!e)[0]
    , node = first && createNode(first);

  if (node && node.privateInstance)
    return new InstanceCollection(elements)

  return new ElementCollection(elements);
}

$.fn = $.prototype = commonPrototype

Object.assign($, {
  querySelectorAll: qsa,
  match: qsa,
  matches,
  selector,
  s: selector,
  isQueryCollection: utils.isQueryCollection,
  dom: utils.findDOMNode
})

$.element = ElementCollection
$.instance = InstanceCollection

$.registerPseudo = (pseudo, isSelector, fn)=> {
  warning(false,
    '`registerPseudo()` has been deprecated in favor of `createPseudo`'
  )
  if (typeof isSelector === 'function')
    fn = isSelector, isSelector = true;

  registerPseudo(pseudo, value => {
    let test = isSelector ? compile(value) : value;
    return node => fn(node, test)
  })
}

$.compileSelector = function(selector) {
  let matcher = compile(selector)
  return (subject) => {
    return utils.isQueryCollection(subject)
      ? subject.nodes.every(matcher)
      : matcher(subject)
  }
}

$.createPseudo = registerPseudo

$.createPseudo('contains', text => node => {
  return ($(node).text() || '').indexOf(text) !== -1
})

$.createPseudo('textContent', text => node => {
  let textContent = node.children
    .filter(n => n.nodeType === NODE_TYPES.TEXT)
    .map(n => n.element)
    .join('')

  return (!text && !!textContent) || text === textContent
})

module.exports = $
