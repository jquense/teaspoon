import { findAll } from 'bill';
import { NODE_TYPES } from 'bill/node';
import * as utils from './utils';
import findIndex from 'lodash/array/findIndex';

function indexOfNode(arr, findNode) {
  return findIndex(arr, (node, i) => {
    return node === findNode ||
      (node.privateInstance || node.element) === (findNode.privateInstance || findNode.element)
  })
}

function noTextNodes(nodes) {
  return nodes.filter(node => node.nodeType !== NODE_TYPES.TEXT)
}

function assertLength(collection, method) {
  if (collection.length === 0)
    throw new Error('the method `' + method + '()` found no matching elements')
  return collection
}

export default function($){

  Object.assign($, {
    dom(component){
      return utils.findDOMNode(component)
    }
  })

  // return values
  ;['every', 'some']
    .forEach(method => {
      let fn = [][method];

      $.fn[method] = function (...args) {
        return fn.apply(this, args)
      }
    })

  // return collections
  ;['map', 'reduce', 'reduceRight']
    .forEach(method => {
      let fn = [][method];

      $.fn[method] = function (...args) {
        return $(fn.apply(this, args))
      }
    })

  Object.assign($.fn, {

    _reduce(...args) {
      return $(this.nodes.reduce(...args), this)
    },

    _map(cb){
      var result = []
      this.each((...args) => result.push(cb(...args)))
      return result
    },

    each(fn, thisArg) {
      [].forEach.call(this, fn, thisArg || this)
      return this;
    },

    tap(fn) {
      fn.call(this, this)
      return this
    },

    get() {
      var result = []
      this.each(el => result.push(el))
      return result
    },

    find(selector, includeSelf = false) {
      return this._reduce((result, node) => {
        return result.concat(utils.match(selector, node, includeSelf))
      }, [])
    },

    traverse(test) {
      return this._reduce((result, node) => {
        return result.concat(findAll(node, test))
      }, [])
    },

    filter(selector) {
      if (!selector) return this

      let matches = utils.match(selector, this.context.nodes[0], true);

      return this._reduce((result, node) => {
        if (indexOfNode(matches, node) !== -1)
          result.push(node);

        return result
      }, [])
    },

    is(selector) {
      return this.filter(selector).length === this.length
    },

    children(selector) {
      return this
        ._reduce((result, node) => result.concat(noTextNodes(node.children)), [])
        .filter(selector)
    },

    text() {
      let isText = el => typeof el === 'string';

      return this.find(':text').nodes
        .reduce((str, node) => str + node.element, '')
    },

    first(selector) {
      return selector
        ? this.find(selector).first()
        : $(assertLength(this, 'first')[0], this)
    },

    last(selector) {
      return selector
        ? this.find(selector).last()
        : $(assertLength(this, 'last')[this.length - 1], this)
    },

    only() {
      if (this.length !== 1)
        throw new Error('The query found: ' + this.length + ' items not 1')

      return this.first()
    },

    single(selector) {
      return selector
        ? this.find(selector).only()
        : this.only()
    },

    unwrap() {
      return this.single()[0]
    },

    elements() {
      return this.nodes.map(node => node.element)
    }
  })
}
