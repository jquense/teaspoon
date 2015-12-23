import React from 'react';
import ReactDOM from 'react-dom';
import ReactInstanceMap from 'react/lib/ReactInstanceMap';
import {
    getID, getNode, findReactContainerForID
  , getReactRootID, _instancesByReactRootID } from 'react/lib/ReactMount';
import ReactTestUtils from'react-addons-test-utils';

import closest from 'dom-helpers/query/closest';
import { match as _match, selector as s } from 'bill';

import { findAll as instanceTraverse } from 'bill/instance-selector';
import { findAll as elementTraverse } from 'bill/element-selector';

export let isDOMComponent = ReactTestUtils.isDOMComponent;

export function attachToInstance(inst, publicNodes) {
  inst.length = publicNodes.length;
  publicNodes.forEach((pn, idx) => inst[idx] = pn)
}

export function isCompositeComponent(inst) {
  if (ReactTestUtils.isDOMComponent(inst)) {
    // Accessing inst.setState warns; just return false as that'll be what
    // this returns when we have DOM nodes as refs directly
    return false;
  }
  return inst === null || typeof inst.render === 'function' && typeof inst.setState === 'function';
}

export function getPublicInstances(nodes) {
  let isInstanceTree = false;
  return nodes.map(node => {
    let privInst = node.privateInstance;

    if (isInstanceTree && !privInst && React.isValidElement(node.element))
      throw new Error('Polymorphic collections are not allowed')
    isInstanceTree = !!privInst
    return getPublicInstance(node)
  })
}

export function getPublicInstance(node) {
  let privInst = node.privateInstance
    , inst = node.instance;

  if (!privInst)
    inst = node.element
  else if (privInst.getPublicInstance && privInst.getPublicInstance() === null)
    inst = ReactDOM.findDOMNode(privInst._instance)

  else if (inst && inst.__isStatelessWrapper)
    inst = ReactDOM.findDOMNode(inst)

  return inst
}

export function getInternalInstance(component){
  if (!component) return

  if (component.getPublicInstance)
    return component

  if (component.__isStatelessWrapper)
    return ReactInstanceMap.get(component)._renderedComponent

  if (component._reactInternalComponent)
    return component._reactInternalComponent

  return ReactInstanceMap.get(component)
}

export function wrapStateless(Element){
  class StatelessWrapper extends React.Component {
    constructor(){
      super()
      this.__isStatelessWrapper = true
    }
    render(){
      return Element
    }
  }

  return <StatelessWrapper />
}

export function getMountPoint(instance){
  var id = getID(findDOMNode(instance));
  return findReactContainerForID(id);
}

export function getRootInstance(mountPoint){
  return _instancesByReactRootID[getReactRootID(mountPoint)];
}

export function findDOMNode(component){
  return component instanceof HTMLElement
    ? component
    : component && component._rootID
        ? getNode(component._rootID)
        : ReactDOM.findDOMNode(component)
}

export function getInstanceChildren(inst){
  let publicInst;

  if (!inst) return [];

  if (inst.getPublicInstance)
    publicInst = inst.getPublicInstance()

  if (ReactTestUtils.isDOMComponent(publicInst)) {
    let renderedChildren = inst._renderedChildren || {};

    return Object.keys(renderedChildren)
      .map(key => renderedChildren[key])
      .filter(node => typeof node._currentElement !== 'string' )
  }
  else if (isCompositeComponent(publicInst)) {
    let rendered = inst._renderedComponent;
    if (rendered && typeof rendered._currentElement !== 'string')
      return [rendered]
  }

  return []
}

export function match(selector, tree, includeSelf){
  if (typeof selector === 'function')
    selector = s`${selector}`

  return _match(selector, tree, includeSelf)
}

export function traverse(tree, test, includeSelf = true){
  if (React.isValidElement(tree))
    return elementTraverse(tree, test, includeSelf)

  return instanceTraverse(tree, test, includeSelf)
}
