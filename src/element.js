import React, { cloneElement } from 'react';
import ReactTestUtils from'react-addons-test-utils';
import createQueryCollection from './QueryCollection';
import iQuery from './instance'
import {
  assertLength, assertRoot, assertStateful
  , render, attachElementsToCollection, collectArgs
} from './utils';

import { createNode } from 'bill/node';
import defaults from './defaults';
import invariant from 'invariant';

let createCallback = (collection, fn) => ()=> fn.call(collection, collection)

function getShallowInstance(renderer) {
  return renderer && renderer._instance._instance;
}

function getShallowTreeWithRoot(renderer) {
  let children = renderer.getRenderOutput()
    , instance = getShallowInstance(renderer)
    , element = createNode(instance).element;

  return React.cloneElement(element, { children })
}

function spyOnUpdate(inst, fn) {
  if (!inst) return;
  let didUpdate = inst.componentDidUpdate;

  inst.componentDidUpdate = function(...args) {
    fn.apply(this, args)
    didUpdate && didUpdate.apply(this, args)
  }
}

let $ = createQueryCollection(function (elements, lastCollection) {
  if (lastCollection) {
    this._rendered = lastCollection._rendered
  }
})

Object.assign($.fn, {

  _instance() {
    return getShallowInstance(this._renderer);
  },

  render(intoDocument, mountPoint, context) {
    if (arguments.length && typeof intoDocument !== 'boolean') {
      context = mountPoint
      mountPoint = intoDocument
      intoDocument = false
    }

    if (mountPoint && !(mountPoint instanceof window.HTMLElement)) {
      context = mountPoint
      mountPoint = null
    }

    var mount = mountPoint || document.createElement('div')
      , element = assertLength(this, 'render')[0];

    if (intoDocument)
      document.body.appendChild(mount)

    if (defaults.context && context)
      context = { ...defaults.context, ...context }

    let { instance, wrapper } = render(element, mount, {
      context: context || defaults.context
    })

    let collection = iQuery(instance);

    collection._mountPoint = mount
    collection._rootWrapper = wrapper;
    return collection;
  },

  shallowRender(props, context) {
    if (!this.length) return this

    let element = this[0];
    let isDomElement = typeof element.type === 'string';

    if (props)
      element = cloneElement(element, props)

    if (isDomElement)
      return $(element)

    let renderer = ReactTestUtils.createRenderer()

    if (defaults.context && context)
      context = { ...defaults.context, ...context }

    renderer.render(element, context || defaults.context);

    let collection = $(getShallowTreeWithRoot(renderer));

    collection._rendered = true;
    collection._renderer = renderer;

    spyOnUpdate(collection._instance(), ()=> collection.update())

    return collection;
  },

  update() {
    assertRoot(this)
    if (!this._renderer)
      throw new Error('You can only preform this action on a "root" element.')

    attachElementsToCollection(this, getShallowTreeWithRoot(this._renderer))
    return this
  },

  props(...args) {
    let value = collectArgs(...args)
    let node = assertLength(this, 'props').nodes[0]

    if (args.length === 0 || (typeof value === 'string' && args.length === 1)) {
      let element = node.element
      return value ? element.props[value] : element.props
    }

    if (this._rendered) {
      assertRoot(this, 'changing the props on a shallow rendered child is an anti-pattern, ' +
       'since the elements props will be overridden by its parent in the next update() of the root element')

      this._renderer.render(React.cloneElement(this[0], value));
      attachElementsToCollection(this, getShallowTreeWithRoot(this._renderer))
      return this
    }

    return this.map(el => React.isValidElement(el)
      ? React.cloneElement(el, value) : el)
  },

  state(...args) {
    let value = collectArgs(...args)
      , callback = args[2] || args[1];

    assertLength(this, 'state')
    assertStateful(this.nodes[0])

    invariant(this._rendered,
      'Only rendered trees can be stateful; ' +
      'use either `shallowRender` or `render` first before inspecting or setting state.'
    )

    assertRoot(this,
      'Only the root component of shallowly rendered tree is instantiated; ' +
      'children elements are stateless so inspecting or setting state on them does\'t make sense ' +
      'use DOM rendering to verifying child state, or select and shallowRender the child itself.'
    )

    if (args.length === 0 || (typeof value === 'string' && args.length === 1)) {
      let key = value
        , state = this._instance().state;

      return key && state ? state[key] : state
    }

    callback = typeof callback === 'function'
      ? createCallback(this, callback) : undefined

    this._instance().setState(value, callback)

    return this
  },

  context(...args) {
    let value = collectArgs(...args)
    let inst = assertLength(this, 'context')._instance()
    let context = inst.context

    invariant(this._rendered,
      'Only rendered trees can pass context; ' +
      'use either `shallowRender` or `render` first before inspecting or setting context.'
    )

    assertRoot(this,
      'Only the root component of a shallowly rendered tree is instantiated; ' +
      'The children are jsut plain elements and are not passed context.'
    )

    if (args.length === 0 || (typeof value === 'string' && args.length === 1)) {
      return value && context ? context[value] : context
    }

    this._renderer.render(this[0], { ...context, ...value });
    attachElementsToCollection(this, getShallowTreeWithRoot(this._renderer))

    return this
  },

  trigger(event, ...args) {
    if (event.indexOf('on') !== 0)
      event = 'on' + event[0].toUpperCase() + event.substr(1)

    return this.each(component => {
      component.props[event]
        && component.props[event](...args)
    });
  }

})


export default $;
