import React, { cloneElement, isValidElement } from 'react';
import TestUtils from 'react-addons-test-utils';
import { match as _match, selector as s } from 'bill';

let isRtq = item => item && item.__isRTQ

rtq.s = rtq.selector = s;

export default rtq;

function match(selector, tree, includeSelf){
  if (typeof selector === 'function')
    selector = s`${selector}`

  return _match(selector, tree, includeSelf)
}

function render(element){
  let root = element;

  if (!(typeof root.type === 'string' && root.type.toLowerCase() === root.type)){
    let renderer = TestUtils.createRenderer()
    renderer.render(element)
    root = renderer.getRenderOutput();
  }

  return {
    root,
    setProps(props){
      return render(cloneElement(element, props))
    }
  }
}

function rtq(element) {
  var context, rerender;

  if (TestUtils.isElement(element)) {
    let { root, setProps } = render(element)
    element = context = root
    rerender = setProps
  }
  else if (isRtq(element)) {
    context = element.root
    element = element.get();
  }

  return new ShallowCollection(element, context, rerender)
}

class ShallowCollection {
  constructor(elements, root, rerender){
    elements = [].concat(elements).filter(el => isValidElement(el))

    var idx = -1;

    while( ++idx < elements.length)
      this[idx] = elements[idx]

    this._rerender = rerender
    this.length = elements.length
    this.root = root
  }

  setProps(props){
    this._rerender && this._rerender(props)
    return this
  }

  each(cb) {
    var idx = -1, len = this.length;
    while (++idx < len) cb(this[idx], idx, this)
    return this
  }

  get() {
    var result = []
    this.each(el => result.push(el))
    return result
  }

  reduce(cb, initial){
    return new ShallowCollection(
        [].reduce.call(this, cb, initial)
      , this.root
    )
  }

  map(cb) {
    var result = []
    this.each((v, i, l) => result.push(cb(v, i, l)))

    return new ShallowCollection(result, this.root)
  }

  find(selector) {
    return this.reduce((result, element) => {
      return result.concat(match(selector, element))
    }, [])
  }

  children(selector) {
    return this
      .reduce((result, element) => result.concat(element.props.children || []), [])
      .filter(selector)
  }

  filter(selector) {
    if (!selector)
      return this

    let matches = match(selector, this.root);

    return new ShallowCollection([].filter.call(this, el => {
      return matches.indexOf(el) !== -1
    }), this.root)
  }


  is(selector) {
    return this.filter(selector).length === this.length
  }

  first(selector){
    return selector
      ? this.find(selector).first()
      : new ShallowCollection(this[0], this.root)
  }

  last(selector){
    return selector
      ? this.find(selector).last()
      : new ComponentCollection(this[this.length - 1], this.root)
  }

  text(){
    let str = '';

    this.each(element => traverse(element,
      el => typeof el === 'string' && (str += el))
    )
    return str
  }
}

function traverse(element, cb){
  cb(element)

  if (element && element.props)
    React.Children.forEach(element.props.children, child => {
      traverse(child, cb)
    })
}
