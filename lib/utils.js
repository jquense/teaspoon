'use strict';

exports.__esModule = true;
exports._findAllInRenderedTree = _findAllInRenderedTree;
exports.isCompositeComponent = isCompositeComponent;
exports.isCompositeComponentWithType = isCompositeComponentWithType;
exports.findAllInRenderedTree = findAllInRenderedTree;
exports.componentsByTagName = componentsByTagName;
exports.componentsByClassName = componentsByClassName;
exports.componentsByType = componentsByType;
var React = require('react');
var ReactDOM = require('react-dom');
var ReactInstanceMap = require('react/lib/ReactInstanceMap');
var ReactTestUtils = require('react-addons-test-utils');

function _findAllInRenderedTree(inst, test) {
  if (!inst || !inst.getPublicInstance) return [];

  var publicInst = inst.getPublicInstance();

  var ret = [];

  if (test(publicInst, inst)) {
    ret = ret.concat(inst);
  }

  if (ReactTestUtils.isDOMComponent(publicInst)) {
    var key,
        renderedChildren = inst._renderedChildren;

    for (key in renderedChildren) {
      if (!renderedChildren.hasOwnProperty(key)) continue;
      ret = ret.concat(_findAllInRenderedTree(renderedChildren[key], test));
    }
  } else if (isCompositeComponent(publicInst)) {
    ret = ret.concat(_findAllInRenderedTree(inst._renderedComponent, test));
  }

  return ret;
}

function isCompositeComponent(inst) {
  if (ReactTestUtils.isDOMComponent(inst)) {
    // Accessing inst.setState warns; just return false as that'll be what
    // this returns when we have DOM nodes as refs directly
    return false;
  }
  return inst === null || typeof inst.render === 'function' && typeof inst.setState === 'function';
}

function isCompositeComponentWithType(inst, type) {
  if (!isCompositeComponent(inst)) return false;
  var internalInstance = ReactInstanceMap.get(inst);
  var constructor = internalInstance._currentElement.type;
  return constructor === type;
}

function findAllInRenderedTree(inst, test) {
  if (!inst) return [];
  return _findAllInRenderedTree(inst.getPublicInstance ? inst : ReactInstanceMap.get(inst), test);
}

function componentsByTagName(root, tagName) {
  return findAllInRenderedTree(root, function (inst) {
    return ReactTestUtils.isDOMComponent(inst) && inst.tagName.toUpperCase() === tagName.toUpperCase();
  });
}

function componentsByClassName(root, className) {
  return findAllInRenderedTree(root, function (inst) {
    if (ReactTestUtils.isDOMComponent(inst)) {
      var instClassName = ReactDOM.findDOMNode(inst).className;
      return instClassName && ('' + instClassName).split(/\s+/).indexOf(className) !== -1;
    }
  });
}

function componentsByType(root, componentType) {
  return findAllInRenderedTree(root, function (inst, privateInst) {
    if (!isCompositeComponent(inst)) return false;

    var constructor = privateInst._currentElement.type;
    return constructor === componentType;
  });
}