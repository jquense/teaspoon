import invariant from 'invariant';
import { findAll, registerPseudo } from 'bill';
import { NODE_TYPES } from 'bill/node';
import * as utils from './utils';
import findIndex from 'lodash/array/findIndex';
import create from 'lodash/object/create'
let { assertLength, is } = utils;

function indexOfNode(arr, findNode) {
  return findIndex(arr, (node, i) => {
    return node === findNode ||
      (node.privateInstance || node.element) === (findNode.privateInstance || findNode.element)
  })
}

function noTextNodes(nodes) {
  return nodes.filter(node => node.nodeType !== NODE_TYPES.TEXT)
}

let $ = (t, ...args) => new t.constructor(...args)



let common = {

  _reduce(...args) {
    return $(this, this.nodes.reduce(...args), this)
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

    return this._reduce((result, node) => {
      return is(selector, node) ? result.concat(node) : result
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

  parent(selector) {
    return this._reduce((nodes, node) => {
      let match = true;

      if (node = node.parentNode) {
        if (selector)
          match = is(selector, node)

        if (match && nodes.indexOf(node) === -1)
          nodes.push(node)
      }
      return nodes
    }, [])
  },

  parents(selector) {
    return this._reduce((nodes, node) => {
      while (node = node.parentNode) {
        let match = true;

        if (selector)
          match = is(selector, node)

        if (match && nodes.indexOf(node) === -1)
          nodes.push(node)
      }

      return nodes
    }, [])
  },

  closest(selector) {
    let test = selector ? n => is(selector, n) : (() => true)

    return this._reduce((nodes, node) => {
      do {
        node = node.parentNode
      }
      while (node && !test(node))

      if (node && nodes.indexOf(node) === -1)
        nodes.push(node)

      return nodes
    }, [])
  },

  text() {
    let isText = el => typeof el === 'string';

    return this.find(':text').nodes
      .reduce((str, node) => str + node.element, '')
  },

  first(selector) {
    return selector
      ? this.find(selector).first()
      : $(this, assertLength(this, 'first')[0], this)
  },

  last(selector) {
    return selector
      ? this.find(selector).last()
      : $(this, assertLength(this, 'last')[this.length - 1], this)
  },

  nth(n, selector) {
    n = Math.max(0, Math.min(n, this.length))
    return selector
      ? this.find(selector).nth(n)
      : $(this, assertLength(this, 'nth')[n], this)
  },

  only() {
    if (this.length !== 1)
      throw new Error('The query found: ' + this.length + ' items not 1')

    return this.first()
  },

  unwrap() {
    return this.single()[0]
  },

  elements() {
    return this.nodes.map(node => node.element)
  }
}

function unwrap(arr){
  return arr && arr.length === 1 ? arr[0] : arr
}

let asserts = {
  none: [
    c => c.length === 0,
    c => `The query found ${c.length}, but expected to find zero nodes.`
  ],
  any: [
    c => c.length !== 0,
    c => `The query found ${c.length}, but expected to find 1 or more nodes.`
  ],
  single: [
    c =>  c.length === 1,
    c => `The query found: ${c.length} items not 1`
  ]
}

Object.keys(asserts).forEach(name => {
  let [ test, msg ] = asserts[name];

  common[name] = function (selector) {
    if (selector)
      return this.find(selector)[name]()

    invariant(test(this), msg(this))
    return this
  }
})

// return values
;['every', 'some']
  .forEach(method => {
    let fn = Array.prototype[method];

    common[method] = function (...args) {
      return fn.apply(this, args)
    }
  })

// return collections
;['map', 'reduce', 'reduceRight']
  .forEach(method => {
    let fn = Array.prototype[method];

    common[method] = function (...args) {
      return $(this, fn.apply(this, args))
    }
  })

let aliases = {
  get: 'toArray',
  each: 'forEach'
}

Object.keys(aliases)
  .forEach(method => common[aliases[method]] = common[method])

export default common
