import React from 'react';
import ReactDOM from 'react-dom';
import invariant from 'invariant';

import bill from 'bill';
import { ifDef } from 'bill/compat';
import { createNode, NODE_TYPES } from 'bill/node';

let ReactTestUtils = require('react-dom/test-utils');
let ReactShallowRenderer = require('react-test-renderer/shallow');
let ReactMount = require('react-dom/lib/ReactMount')


let {
    getID, getNode, findReactContainerForID
  , getReactRootID, _instancesByReactRootID } = ReactMount;

export const Simulate = ReactTestUtils.Simulate;

export const createShallowRenderer = () => new ReactShallowRenderer();

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

export function render(element, mount, { props, context }, renderFn) {
  let renderInstance
    , wrapper, prevWrapper;

  renderFn = renderFn || ReactDOM.render;

  if (isQueryCollection(element)) {
    let node = element.nodes[0];

    assertRoot(element)
    mount = element._mountPoint || mount
    prevWrapper = element._rootWrapper
    element = node.element;
  }

  if (props)
    element = React.cloneElement(element, props);

  if (context) {
    wrapper = element = wrapElement(element, context, prevWrapper)
    renderInstance = createNode(wrapper).instance;
  }

  let instance = renderFn(element, mount);

  if (!renderInstance)
    renderInstance = instance

  if (instance === null) {
    renderInstance = null;
    wrapper = wrapElement(element, null, prevWrapper)
    instance = renderFn(wrapper, mount)
  }

  if (wrapper)
    wrapper = wrapper.type;

  return { wrapper, instance, renderInstance };
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
      .reduce((t, k) => ({ ...t, [k]: () => {} }), {})
  }

  return <TspWrapper context={context}>{element}</TspWrapper>
}

export let getMountPoint = ifDef({
  '>=15.x.x': function getMountPoint(instance) {
    let privInst = createNode(instance).privateInstance
    let info = privInst._nativeContainerInfo || privInst._hostContainerInfo;
    let container = createNode(info._topLevelWrapper)
    return findDOMNode(container.instance).parentNode
  },
  '*': function getMountPoint(instance) {
    var id = getID(findDOMNode(instance));
    return findReactContainerForID(id);
  }
})

export function getRootInstance(mountPoint){
  return _instancesByReactRootID[getReactRootID(mountPoint)];
}

export function findDOMNode(component){
  return component instanceof window.HTMLElement
    ? component
    : component && component._rootID
        ? getNode(component._rootID)
        : component ? ReactDOM.findDOMNode(component) : null
}

let buildSelector = sel => typeof sel === 'function' ? bill.selector`${sel}` : sel

export function matches(selector, tree) {
  return !!bill.matches(buildSelector(selector), tree)
}

export function qsa(selector, tree, includeSelf) {
  return bill.querySelectorAll(buildSelector(selector), tree, includeSelf)
}
