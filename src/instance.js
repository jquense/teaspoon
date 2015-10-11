import React from 'react';
import ReactDOM from 'react-dom';
import ReactInstanceMap from 'react/lib/ReactInstanceMap';
import ReactTestUtils from'react-addons-test-utils';

import closest from 'dom-helpers/query/closest';
import createQueryCollection from './QueryCollection';
import * as utils from './utils';
import { match } from './utils';
import selector from 'bill';

let $ = createQueryCollection(match, selector, function init(components, context, mount){
  let first = components[0]

  mount = mount || (context && context._mountPoint) || utils.getMountPoint(first);

  this.context = (context && context.context)
              || context
              || utils.getInternalInstance(utils.getRootInstance(mount))

  this._mountPoint = mount;
  this._privateInstances = Object.create(null)

  return components.map((component, idx) => {
    let instances = utils.getInstances(component);
    this._privateInstances[idx] = instances.private
    return instances.public
  })
})

Object.assign($, {
  dom(component){
    return utils.findDOMNode(component)
  }
})

Object.assign($.fn, {

  _subjects(){
    return [].map.call(this,
      (_, idx) => this._privateInstances[idx])
  },

  _reduce(cb, initial){
    return $(this._subjects().reduce(cb, initial), this)
  },

  unmount(){
    let inBody = this._mountPoint.parentNode
      , nextContext = this.context._currentElement;

    ReactDOM.unmountComponentAtNode(this._mountPoint)

    if (inBody)
      document.body.removeChild(this._mountPoint)

    this.context = null

    return eQuery(nextContext)
  },

  dom(){
    return unwrap(this._map($.dom))
  },

  text(){
    let isText = el => typeof el === 'string';

    return this._subjects().reduce((str, element)=> {
      return str + utils.traverse(element, isText)
        .map(inst => inst._currentElement || inst)
        .join('')
    }, '')
  },

  trigger(event, data){
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
