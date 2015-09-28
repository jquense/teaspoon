var React = require('react');
var ReactDOM = require('react-dom')
var ReactInstanceMap = require('react/lib/ReactInstanceMap');
var ReactTestUtils = require('react-addons-test-utils')

import { create as createCompiler, parse } from 'bill/compiler';
import { isCompositeComponent } from './utils';

let compiler = createCompiler()

compiler.registerPseudo('has', function(compiledSelector) {
  return (root, inst) => {
    let matches = findAll(inst, compiledSelector)
    return !!matches.length
  }
})

compiler.registerPseudo('dom', function() {
  return (root, inst) => {
    return typeof root.type === 'string' && root.type.toLowerCase() === root.type
  }
})

compiler.registerPseudo('composite', function() {
  return (root, inst) => {
    return typeof root.type === 'function'
  }
})

compiler.registerNesting('any', test => anyParent.bind(null, test))

compiler.registerNesting('>', test => directParent.bind(null, test))


function findAll(inst, test, getParent = ()=> ({ parent: null }), excludeSelf = true) {
  let found = [];

  if (!inst || !inst.getPublicInstance)
    return found;

  let publicInst = inst.getPublicInstance()
    , element = inst._currentElement
    , parent = ()=> ({ parent: element, getParent });

  if (!excludeSelf && test(element, inst, getParent))
    found = found.concat(inst)

  if (ReactTestUtils.isDOMComponent(publicInst)) {
    let renderedChildren = inst._renderedChildren || {};

    Object.keys(renderedChildren).forEach(key => {
      found = found.concat(
        findAll(renderedChildren[key], test, parent, false)
      );
    })
  }
  else if (isCompositeComponent(publicInst)) {
    found = found.concat(findAll(inst._renderedComponent, test, parent, false));
  }

  return found;
}

function anyParent(test, element, inst, parentNode){
  do {
    var { getParent, parent } = parentNode();
    element = parent
    parentNode = getParent
  } while(element && !test(element, test, getParent))

  return !!element
}

function directParent(test, element, inst, parentNode) {
  element = parentNode().parent
  return !!(element && test(element, parentNode().getParent))
}

export function match(selector, inst, includeSelf = true) {
  let tree = inst.getPublicInstance ? inst : ReactInstanceMap.get(inst)

  return findAll(tree, compiler.compile(selector), undefined, !includeSelf)
}

export let { compile, compileRule, selector } = compiler
