import React from 'react';
import ReactDOM from 'react-dom';
import ReactInstanceMap from 'react/lib/ReactInstanceMap';
import utils from 'react-addons-test-utils';
import { match as _match, selector as sel } from './instance-selector';
import hasClass from 'dom-helpers/class/hasClass';

var $r = module.exports = rtq

let isRtq = item => item && item._isRTQ

rtq.react = React;
rtq.s = rtq.selector = sel;

function rtq(element, mount, renderIntoDocument = (mount === true)) {
  var context;

  if (!mount || mount === true)
    mount = document.createElement('div')

  if (utils.isElement(element))
    context = element = render(element, mount, renderIntoDocument)
  else if (utils.isDOMComponent(element) || utils.isCompositeComponent(element)){
    context = element
    mount = rtq.dom(element).parentNode
  }
  else if (isRtq(element)) {
    mount = element._mountPoint
    context = element.context
    element = element.get();
  }
  else
    throw new TypeError('Wrong type: must either be ReactElement or a Component Instance')

  return new ComponentCollection(element, context, mount)
}

function render(element, mountPoint, renderIntoDocument = false) {
  var mount = mountPoint;

  if (renderIntoDocument)
    document.body.appendChild(mount)

  let instance = ReactDOM.render(element, mount);

  if (instance === null) {
    instance = ReactDOM.render(wrapStateless(element), mount)
  }

  if (!instance.renderWithProps) {
    instance.renderWithProps = newProps => render(
        React.cloneElement(element, newProps)
      , mount
      , renderIntoDocument
    )
  }

  return instance;
}

function match(selector, tree, includeSelf){
  if (typeof selector === 'function')
    selector = sel`${selector}`

  return _match(selector, tree, includeSelf)
}

rtq.dom = function(component){
 return component instanceof HTMLElement ? component : ReactDOM.findDOMNode(component)
}


class ComponentCollection {

  constructor(_components, context, mountPoint, selector){
    var components = _components == null ? [] : [].concat(_components)
      , idx = -1, len = components.length

    this._privateInstances = Object.create(null)

    while (++idx < len) {
      var component = components[idx]

      if (component.getPublicInstance) {
        this._privateInstances[idx] = component
        component = component.getPublicInstance();

        //stateless
        if (component === null)
          component = ReactDOM.findDOMNode(this._privateInstances[idx]._instance)
      }
      // if this a root Stateless component
      else if (component && component.__isRTQstatelessWrapper){
        let wrapperInstance = ReactInstanceMap.get(component);
        this._privateInstances[idx] = wrapperInstance._renderedComponent;
        component = ReactDOM.findDOMNode(component)
      }
      else {
        this._privateInstances[idx] = ReactInstanceMap.get(component) || component._reactInternalComponent
      }

      this[idx] = component
    }

    this.length = len
    this.context = context
    this.selector = selector
    this._mountPoint = mountPoint
    this._isRTQ = true
  }

  _root(){
    return this.context._reactInternalComponent || this.context
  }

  unmount(){
    let inBody = !!this.context.parentNode;
    ReactDOM.unmountComponentAtNode(this._mountPoint)

    if (inBody)
      document.body.removeChild(this._mountPoint)

    this.context = null
  }

  setProps(newProps){
    return this.mapInPlace(element => element.renderWithProps(newProps))
  }

  each(cb, thisArg) {
    var idx = -1, len = this.length;
    while( ++idx < len ) cb.call(thisArg, this[idx], idx, this)
    return this
  }

  mapInPlace(cb, thisArg) {
    return this.each((el, idx, list)=> this[idx] = cb(el, idx, list))
  }

  map(cb, thisArg) {
    var idx = -1, len = this.length, result = []
    while (++idx < len) result.push(cb.call(thisArg, this[idx], idx, this))
    return result
  }

  _reduce(cb, initial){
    return new ComponentCollection(
        this._getInstances().reduce(cb, initial)
      , this.context
      , this._mountPount
      , this.selector
    )
  }

  reduce(cb, initial){
    return new ComponentCollection(
        [].reduce.call(this, cb, initial)
      , this.context
      , this._mountPount
      , this.selector
    )
  }

  _getInstances(){
    return this.map((_, idx) => {
      return this._privateInstances[idx]
    })
  }

  get(){
    return unwrap(this.map(component => component))
  }

  dom() {
    return unwrap(this.map(rtq.dom))
  }

  find(selector){
    return this._reduce((result, instance) => {
      return result.concat(match(selector, instance, false))
    }, [])
  }

  filter(selector) {
    if (!selector) return this

    let matches = match(selector, this._root());

    return this._reduce((result, el) => {
      return matches.indexOf(el) !== -1 ? result.concat(el) : result
    }, [])
  }

  only(){
    if (this.length !== 1) throw Error('`' + this.selector +'` found: ' + this.length + ' not 1 ')
    return this.first()
  }

  single(selector) {
    return selector
      ? this.find(selector).only()
      : this.only()
  }

  first(selector){
    return selector
      ? this.find(selector).first()
      : new ComponentCollection(this[0], this.context, this._mountPount, this.selector)
  }

  last(selector){
    return selector
      ? this.find(selector).last()
      : new ComponentCollection(this[this.length - 1], this.context, this._mountPount, this.selector)
  }

  is(selector) {
    return this.filter(selector).length === this.length
  }

  trigger(event, data){
    data = data || {}

    if (event.substr(0, 2) === 'on' )
      event = event.substr(2, 1).toLowerCase() + event.substr(3)

    if (!(event in utils.Simulate))
      throw new TypeError( '"' + event + '" is not a supported DOM event')

    return this.each(component =>
      utils.Simulate[event]($r.dom(component), data))
  }
}


function unwrap(arr){
  return arr && arr.length === 1 ? arr[0] : arr
}

function wrapStateless(Element){
  class StatelessWrapper extends React.Component {
    constructor(){
      super()
      this.__isRTQstatelessWrapper = true
    }
    render(){
      return Element
    }
  }

  return <StatelessWrapper />
}
