import common from './common';


export default function(match, selector, init){

  function QueryCollection(...args){

    return new QueryCollection.fn.init(...args)
  }

  Object.assign(QueryCollection, {
    match,
    selector,
    s: selector,
    isQueryCollection(inst){
      return !!inst._isQueryCollection
    }
  })

  QueryCollection.fn =
    QueryCollection.prototype = {
      constructor: QueryCollection,
    }

  createInit(QueryCollection)
  common(QueryCollection)

  return QueryCollection

  function createInit($){

    $.fn.init = function $init(element, context, ...args){
      let elements = element == null ? [] : [].concat(element);

      if ($.isQueryCollection(element)) {
        return new element.constructor(element.get(), element.context)
      }
      else {
        this.context = (context && context.context) || context || element;
        elements = init.call(this, elements, context, ...args);
      }

      if ($.isQueryCollection(elements))
        return elements

      elements.forEach((el, idx)=> this[idx] = el)

      this._isQueryCollection = true
      this.length = elements.length;
    }

    $.fn.init.prototype = $.fn
  }
}
