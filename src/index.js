import ElementCollection from './element'
import InstanceCollection from './instance'
import commonPrototype from './common';
import { selector, registerPseudo } from 'bill';
import { createNode, NODE_TYPES } from 'bill/node';
import { match, getPublicInstances } from './utils';

import * as utils from './utils';

let isComponent = el => utils.isDOMComponent(el) || utils.isCompositeComponent(el)
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
  match,
  selector,
  s: selector,
  isQueryCollection: utils.isQueryCollection,
  dom: utils.findDOMNode
})

$.element = ElementCollection
$.instance = InstanceCollection

$.registerPseudo = (pseudo, isSelector, fn)=> {
  if (typeof isSelector === 'function')
    fn = isSelector, isSelector = true;

  registerPseudo(pseudo, isSelector, test =>
    node => fn(node, test))
}

$.registerPseudo('contains', false, (node, text) => {
  return ($(node).text() || '').indexOf(text) !== -1
})

$.registerPseudo('textContent', false, (node, text) => {
  let textContent = node.children
    .filter(n => n.nodeType === NODE_TYPES.TEXT)
    .map(n => n.element)
    .join('')

  return (!text && !!textContent) || text === textContent
})

module.exports = $
