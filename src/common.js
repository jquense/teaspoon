import * as utils from './utils';

export default function($){

  Object.assign($, {
    dom(component){
      return utils.findDOMNode(component)
    }
  })

  Object.assign($.fn, {
    _subjects: $.fn.get,

    _reduce: $.fn.reduce,

    _map(cb){
      var result = []
      this.each((...args) => result.push(cb(...args)))
      return result
    },

    each(cb, thisArg) {
      var idx = -1, len = this.length;
      while (++idx < len) cb.call(thisArg, this[idx], idx, this)
      return this
    },

    get() {
      var result = []
      this.each(el => result.push(el))
      return result
    },

    reduce(cb, initial){
      return $([].reduce.call(this, cb, initial), this)
    },

    map(cb) {
      return this.reduce((result, ...args) => {
        result.push(cb(...args))
        return result
      }, [])
    },

    find(selector) {
      return this._reduce((result, element) => {
        return result.concat($.match(selector, element, false))
      }, [])
    },

    traverse(test){
      return this._reduce((result, element) => {
        return result.concat(utils.traverse(element, test))
      }, [])
    },

    filter(selector) {
      if (!selector) return this

      let matches = $.match(selector, this.context, true);

      return this._reduce((result, element) => {
        if (matches.indexOf(element) !== -1)
          result.push(element);

        return result
      }, [])
    },

    is(selector) {
      return this.filter(selector).length === this.length
    },

    first(selector){
      return selector
        ? this.find(selector).first()
        : $(this[0], this)
    },

    last(selector){
      return selector
        ? this.find(selector).last()
        : $(this[this.length - 1], this)
    },

    only(){
      if (this.length !== 1)
        throw new Error('The query found: ' + this.length + ' items not 1 ')

      return this.first()
    },

    single(selector) {
      return selector
        ? this.find(selector).only()
        : this.only()
    },

    node() {
      return this.single()[0]
    }
  })
}
