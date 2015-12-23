import common from './common';
import { createNode } from 'bill/node';
import { selector } from 'bill';
import { match, getPublicInstances } from './utils';

export default function createCollection(ctor) {
  let $ = QueryCollection

  function QueryCollection(element, lastCollection) {
    if (!(this instanceof QueryCollection))
      return new QueryCollection(element, lastCollection)

    let elements = element == null ? [] : [].concat(element);

    if (element && $.isQueryCollection(element)) {
      return new element.constructor(element.get(), element)
    }

    this._isQueryCollection = true
    this.context = lastCollection || this
    this.nodes = elements.map(el => createNode(el))
    this.length = elements.length

    getPublicInstances(this.nodes)
      .forEach((el, idx)=> this[idx] = el)

    return ctor.call(this, element, lastCollection)
  }

  Object.assign($, {
    match,
    selector,
    s: selector,
    isQueryCollection(inst) {
      return !!inst._isQueryCollection
    }
  })

  $.fn = $.prototype = {
    constructor: $,
  }

  common($)

  return $
}
