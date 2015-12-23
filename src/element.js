import React, { isValidElement, cloneElement } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from'react-addons-test-utils';
import warning from 'warning';
import createQueryCollection from './QueryCollection';
import iQuery from './instance'
import * as utils from './utils';
import { selector } from 'bill';

function assertRoot(inst, msg) {
  if (inst.context && inst.context !== inst)
    throw new Error(msg || 'You can only preform this action on "root" element.')
}

function spyOnUpdate(inst, fn) {
  if (!inst) return;
  let didUpdate = inst.componentDidUpdate;

  inst.componentDidUpdate = function(...args) {
    fn(...args)
    didUpdate && didUpdate(...args)
  }
}



let $ = createQueryCollection(function (elements, lastCollection) {
  if (lastCollection && lastCollection.renderer) {
    this.context = this;
    this._renderer = renderer; // different name to protect back compat
    spyOnUpdate(this._instance(), ()=> this.update())
  }
})

$.instance = iQuery

Object.assign($.fn, {

  _instance() {
    return this._renderer && this._renderer._instance._instance;
  },

  render(intoDocument, mountPoint) {
    var mount = mountPoint || document.createElement('div')
      , element = this[0];

    if (intoDocument)
      document.body.appendChild(mount)

    let instance = ReactDOM.render(element, mount);

    if (instance === null) {
      instance = ReactDOM.render(utils.wrapStateless(element), mount)
      instance = utils.getInternalInstance(instance)
    }

    return iQuery(instance);
  },

  shallowRender(props, context) {
    if (!this.length) return this

    let element = this[0];
    let isDomElement = typeof element.type === 'string';

    if (props)
      element = cloneElement(element, props)

    if (isDomElement)
      return $(element)

    if (!this.renderer)
      this.renderer = ReactTestUtils.createRenderer()

    this.renderer.render(element, context);

    let collection = $(this.renderer.getRenderOutput());

    collection._renderer = this.renderer;

    return collection;
  },

  update() {
    if (!this._renderer)
      throw new Error('You can only preform this action on a "root" element.')

    this.context =
      this[0] = this._renderer.getRenderOutput()
    return this
  },

  prop(key) {
    return key ? this[0].props[key] : this[0].props;
  },

  state(key) {
    assertRoot(this, 'Only "root" rendered elements can have state')
    let state = this._instance().state;
    return key && state ? state[key] : state
  },

  trigger(event, ...args) {
    if (event.indexOf('on') !== 0)
      event = 'on' + event[0].toUpperCase() + event.substr(1)

    return this.each(component => {
      component.props[event]
        && component.props[event](...args)

      this._root && this._root.update()
    });
  }

})


export default $;
