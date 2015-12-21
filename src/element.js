import React, { isValidElement, cloneElement } from 'react';
import ReactDOM from 'react-dom';
import ReactTestUtils from'react-addons-test-utils';
import warning from 'warning';
import createQueryCollection from './QueryCollection';
import iQuery from './instance'
import * as utils from './utils';
import { selector } from 'bill';

let isComponent = el => utils.isDOMComponent(el) || utils.isCompositeComponent(el)

function spyOnUpdate(inst, fn) {
  if (!inst) return;
  let didUpdate = inst.componentDidUpdate;

  inst.componentDidUpdate = function(...args) {
    fn(...args)
    didUpdate && didUpdate(...args)
  }
}

let renderWarned = false;

let eQuery = createQueryCollection(utils.match, selector, function init(elements, context, renderer) {
  let first = elements.filter(e => !!e)[0]
    , root = (context && context._root);

  if (first && isComponent(first))
    return iQuery(elements);

  if (renderer) {
    this._renderer = renderer; // different name to protect back compat

    if (!root) {
      root = this
      spyOnUpdate(root._instance(), ()=> root.update())
    }
    this._root = root
  }

  return elements.filter(el => isValidElement(el))
})

let assertRoot = (inst, msg) =>  {
  if (inst._root && inst._root !== inst)
    throw new Error(msg || 'You can only preform this action on "root" element.')
}

eQuery.instance = iQuery

Object.assign(eQuery.fn, {

  _reduce: eQuery.fn.reduce,

  _instance() {
    return this._renderer && this._renderer._instance._instance;
  },

  render(intoDocument, mountPoint) {
    var mount = mountPoint || document.createElement('div')
      , element = this[0];

    if (intoDocument)
      document.body.appendChild(mount)

    let instance = ReactDOM.render(element, mount);

    if (instance === null)
      instance = ReactDOM.render(utils.wrapStateless(element), mount)

    return iQuery(instance, utils.getInternalInstance(instance), mount);
  },

  shallowRender(props) {
    if (!this.length) return this

    let element = this[0];
    let isDomElement = typeof element.type === 'string' && element.type.toLowerCase() === element.type;

    if (props)
      element = cloneElement(element, props)

    if (isDomElement)
      return eQuery(element)

    if (!this.renderer)
      this.renderer = ReactTestUtils.createRenderer()
    else {
      warning(renderWarned,
        'Calling `shallowRender` to update a collection is deprecated, use `update()` instead')
      renderWarned = true;
    }

    this.renderer.render(element);

    element = this.renderer.getRenderOutput();

    return eQuery(element, element, this.renderer);
  },

  update() {
    if (!this._renderer)
      throw new Error('You can only preform this action on a "root" element.')

    this.context =
      this[0] = this._renderer.getRenderOutput()
    return this
  },

  children(selector) {
    return this
      .reduce((result, element) => result.concat(element.props.children || []), [])
      .filter(selector)
  },

  text() {
    let isText = el => typeof el === 'string';

    return this.get().reduce((str, element)=> {
      return str + utils.traverse(element, isText).join('')
    }, '')
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

export default eQuery;
