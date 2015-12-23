import eQuery from './element'
import iQuery from './instance'
import * as utils from './utils';

let isComponent = el => utils.isDOMComponent(el) || utils.isCompositeComponent(el)

function NodeCollection(elements) {
  let first = [].concat(elements).filter(e => !!e)[0];

  if (first && isComponent(first))
    return new iQuery(elements);

  return new eQuery(elements)
}

NodeCollection = Object.assign(NodeCollection, eQuery, iQuery)

module.exports = NodeCollection
