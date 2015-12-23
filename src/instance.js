import React from 'react';
import ReactDOM from 'react-dom';
import ReactUpdateQueue from 'react/lib/ReactUpdateQueue';
import ReactInstanceMap from 'react/lib/ReactInstanceMap';
import ReactTestUtils from'react-addons-test-utils';

import closest from 'dom-helpers/query/closest';
import createCollection from './QueryCollection';
import * as utils from './utils';
import selector from 'bill';

let $ = createCollection(function (element, lastCollection) {
  let first = this.nodes[0]

  if (!lastCollection) {
    this._mountPoint = utils.getMountPoint(first.instance)
  }
})

Object.assign($, {
  dom(component){
    return utils.findDOMNode(component)
  }
})

Object.assign($.fn, {

  _reduce(cb, initial){
    return $(this.nodes.reduce(cb, initial), this)
  },

  unmount() {
    let inBody = this._mountPoint.parentNode
      , nextContext = this.context.nodes[0].element;

    ReactDOM.unmountComponentAtNode(this._mountPoint)

    if (inBody)
      document.body.removeChild(this._mountPoint)

    this.context = null

    return eQuery(nextContext)
  },

  dom() {
    return unwrap(this._map($.dom))
  },

  prop(key, value, cb) {
    if (typeof key === 'string') {
      if (arguments.length === 1)
        return this.nodes[0].element.props[key];
      else
        key = { [key]: value }
    }

    // this.node(inst => {
    //   ReactUpdateQueue.enqueueSetPropsInternal(inst, props)
    //   if (cb)
    //     ReactUpdateQueue.enqueueCallbackInternal(inst, cb)
    // })
  },

  // state(key) {
  //   return this._privateInstances[0].state[key];
  // },
  //
  // context(key) {
  //   return this._privateInstances[0].context[key];
  // },

  trigger(event, data) {
    data = data || {}

    if (event.substr(0, 2) === 'on' )
      event = event.substr(2, 1).toLowerCase() + event.substr(3)

    if (!(event in ReactTestUtils.Simulate))
      throw new TypeError( '"' + event + '" is not a supported DOM event')

    return this.each(component =>
      ReactTestUtils.Simulate[event]($.dom(component), data))
  }
})

function unwrap(arr){
  return arr && arr.length === 1 ? arr[0] : arr
}

export default $;

import eQuery from './element';
