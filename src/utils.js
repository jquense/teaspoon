import React from 'react';
import ReactDOM from 'react-dom';
import ReactInstanceMap from 'react/lib/ReactInstanceMap';
import {
    getID, getNode, findReactContainerForID
  , getReactRootID, _instancesByReactRootID } from 'react/lib/ReactMount';
import ReactTestUtils from'react-addons-test-utils';
import invariant from 'invariant';

import { isNode, match as _match, selector as s, compile } from 'bill';
import { createNode, NODE_TYPES } from 'bill/node';

export let isDOMComponent = ReactTestUtils.isDOMComponent;

export function assertLength(collection, method) {
  invariant(!!collection.length,
    'the method `%s()` found no matching elements', method
  )
  return collection
}

export function assertStateful(node) {
  invariant(
    node.nodeType === NODE_TYPES.COMPOSITE && !isStatelessComponent(node),
    'You are trying to inspect or set state on a stateless component ' +
    'such as a DOM node or functional component'
  );

  return node
}
export function assertRoot(collection, msg) {
  invariant(!collection.root || collection.root === collection,
    msg || 'You can only preform this action on a "root" element.'
  )
  return collection
}

export function render(element, mount, { props, context }) {
  let wrapper, prevWrapper;

  if (isQueryCollection(element)) {
    let node = element.nodes[0];

    assertRoot(element)
    mount = element._mountPoint || mount
    prevWrapper = element._rootWrapper
    element = node.element;
  }

  if (props) {
    element = React.cloneElement(element, props);
  }

  if (context)
    wrapper = element = wrapElement(element, context, prevWrapper)

  let instance = ReactDOM.render(element, mount);

  if (instance === null) {
    wrapper = wrapElement(element, null, prevWrapper)
    instance = ReactDOM.render(wrapper, mount)
  }

  if (wrapper) {
    wrapper = wrapper.type;
  }

  return { wrapper, instance };
}

export function collectArgs(key, value) {
  if (typeof key === 'string') {
    if (arguments.length > 1)
      key = { [key]: value }
  }

  return key
}

export function isCompositeComponent(inst) {
  if (ReactTestUtils.isDOMComponent(inst)) {
    // Accessing inst.setState warns; just return false as that'll be what
    // this returns when we have DOM nodes as refs directly
    return false;
  }
  return inst === null || typeof inst.render === 'function' && typeof inst.setState === 'function';
}


export function isStatelessComponent(node) {
  let privInst = node.privateInstance
  return privInst && privInst.getPublicInstance && privInst.getPublicInstance() === null
}

export function isQueryCollection(collection) {
  return !!(collection && collection._isQueryCollection)
}

export function unwrapAndCreateNode(subject) {
  let node = createNode(subject)
    , inst = node.instance

  if (inst && inst.__isTspWrapper)
    return unwrapAndCreateNode(node.children[0])

  return node
}

export function attachElementsToCollection(collection, elements) {
  collection.nodes = [].concat(elements).filter(el => !!el).map(unwrapAndCreateNode)
  collection.length = collection.nodes.length

  getPublicInstances(collection.nodes)
    .forEach((el, idx)=> collection[idx] = el)
}

export function getPublicInstances(nodes) {
  let isInstanceTree = false;
  return nodes.map(node => {
    let privInst = node.privateInstance;

    invariant(!(isInstanceTree && !privInst && React.isValidElement(node.element)),
      'Polymorphic collections are not allowed'
    )
    isInstanceTree = !!privInst
    return getPublicInstance(node)
  })
}

export function getPublicInstance(node) {
  let privInst = node.privateInstance
    , inst = node.instance;

  console.error('GPI: ', privInst, node.element)

  if (!privInst)
    inst = node.element
  else if (isStatelessComponent(node))
    inst = ReactDOM.findDOMNode(privInst._instance)

  return inst
}

/**
 * Wrap an element in order to provide context or an instance in the case of
 * stateless functional components. `prevWrapper` is necessary for
 * rerendering a wrapped root component, recreating a wrapper each time breaks
 * React reconciliation b/c `current.type !== prev.type`. Instead we reuse and
 * mutate (for childContextTypes) the original component type.
 */
export function wrapElement(element, context, prevWrapper) {
  let TspWrapper = prevWrapper || class extends React.Component {
    constructor(){
      super()
      this.__isTspWrapper = true
    }
    getChildContext() {
      return this.props.context
    }
    render() {
      return this.props.children
    }
  }

  if (context) {
    TspWrapper.childContextTypes = Object.keys(context)
      .reduce((t, k) => ({ ...t, [k]: React.PropTypes.any }), {})
  }

  return <TspWrapper context={context}>{element}</TspWrapper>
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
        : component ? ReactDOM.findDOMNode(component) : null
}

let buildSelector = sel => typeof sel === 'function' ? s`${sel}` : sel

export function is(selector, tree, includeSelf) {
  return !!compile(buildSelector(selector))(tree)
}

export function match(selector, tree, includeSelf) {
  return _match(buildSelector(selector), tree, includeSelf)
}
