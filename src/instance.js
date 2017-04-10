import ReactDOM from 'react-dom';

import createCollection from './QueryCollection';

import {
    render, getMountPoint, findDOMNode
  , assertLength, assertStateful, Simulate
  , attachElementsToCollection, collectArgs } from './utils';

let createCallback = (collection, fn) => ()=> fn.call(collection, collection)

function getSetterMethod(key){
  return function (...args) {
    let value = collectArgs(...args)
    let node = assertLength(this, key).nodes[0]
    let data = node.instance && node.instance[key]

    if (args.length === 0 || (typeof value === 'string' && args.length === 1)) {
      if (!data)
        data = node.privateInstance._currentElement[key];

      return value && data ? data[value] : data
    }

    let { instance } = render(this, null, {
      [key]: { ...data, ...value }
    })

    attachElementsToCollection(this, instance)
    return this
  }
}

let $ = createCollection(function (element, lastCollection) {
  let first = this.nodes[0]

  if (!lastCollection) {
    try {

      // no idea if I can do this in 0.15
      this._mountPoint = getMountPoint(first.instance)
    }
    catch (err) {} // eslint-disable-line
  }
  else
    this._mountPoint = lastCollection._mountPoint
})

Object.assign($.fn, {

  render(...args) {
    let collection = new ElementCollection(this.elements()[0])

    return collection.render(...args)
  },

  shallowRender(...args) {
    let collection = new ElementCollection(this.elements()[0])

    return collection.shallowRender(...args)
  },

  unmount() {
    let inBody = this._mountPoint.parentNode
      , nextContext = this.root.nodes[0].element;

    ReactDOM.unmountComponentAtNode(this._mountPoint)

    if (inBody)
      document.body.removeChild(this._mountPoint)

    this.root = null

    return ElementCollection(nextContext)
  },

  dom() {
    return unwrap(this._map(findDOMNode))
  },

  props: getSetterMethod('props'),

  context: getSetterMethod('context'),

  state(...args) {
    let value = collectArgs(...args)
      , callback = args[2] || args[1]

    let node = assertStateful(
      assertLength(this, 'state').nodes[0]
    )

    if (args.length === 0 || (typeof value === 'string' && args.length === 1)) {
      let key = value
        , state = node.instance.state;

      return key && state ? state[key] : state
    }

    callback = typeof callback === 'function'
      ? createCallback(this, callback) : undefined

    node.instance.setState(value, callback)

    return this
  },

  trigger(event, data) {
    data = data || {}

    if (event.substr(0, 2) === 'on' )
      event = event.substr(2, 1).toLowerCase() + event.substr(3)

    if (!(event in Simulate))
      throw new TypeError( '"' + event + '" is not a supported DOM event')

    return this.each(component =>
      Simulate[event](findDOMNode(component), data))
  }
})

function unwrap(arr){
  return arr && arr.length === 1 ? arr[0] : arr
}

export default $;

import ElementCollection from './element';
