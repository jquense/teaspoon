'use strict';

exports.__esModule = true;
exports.isCompositeComponent = isCompositeComponent;
var ReactTestUtils = require('react-addons-test-utils');

function isCompositeComponent(inst) {
  if (ReactTestUtils.isDOMComponent(inst)) {
    // Accessing inst.setState warns; just return false as that'll be what
    // this returns when we have DOM nodes as refs directly
    return false;
  }
  return inst === null || typeof inst.render === 'function' && typeof inst.setState === 'function';
}