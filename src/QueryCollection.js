
import { selector } from 'bill';
import {
    isQueryCollection, getPublicInstances
  , unwrapAndCreateNode, attachElementsToCollection } from './utils';

import common from './common';

export default function createCollection(ctor) {
  let $ = QueryCollection

  function QueryCollection(element, lastCollection) {
    if (!(this instanceof QueryCollection))
      return new QueryCollection(element, lastCollection)

    let elements = element == null ? [] : [].concat(element);

    if (element && isQueryCollection(element)) {
      return new element.constructor(element.get(), element)
    }

    this._isQueryCollection = true
    this.root = lastCollection || this

    attachElementsToCollection(this, elements)

    return ctor.call(this, elements, lastCollection)
  }

  $.fn = $.prototype = Object.create(common)

  Object.defineProperty($.prototype, 'constructor', {
    value: $,
    enumerable: false,
    writable: true,
    configurable: true
  })

  return $
}
