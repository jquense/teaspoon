'use strict';

exports.__esModule = true;
exports.match = match;

var _billCompiler = require('bill/compiler');

var _utils = require('./utils');

var React = require('react');
var ReactDOM = require('react-dom');
var ReactInstanceMap = require('react/lib/ReactInstanceMap');
var ReactTestUtils = require('react-addons-test-utils');

var compiler = _billCompiler.create();

compiler.registerPseudo('has', function (compiledSelector) {
  return function (root, inst) {
    var matches = findAll(inst, compiledSelector);
    return !!matches.length;
  };
});

compiler.registerPseudo('dom', function () {
  return function (root, inst) {
    return typeof root.type === 'string' && root.type.toLowerCase() === root.type;
  };
});

compiler.registerPseudo('composite', function () {
  return function (root, inst) {
    return typeof root.type === 'function';
  };
});

compiler.registerNesting('any', function (test) {
  return anyParent.bind(null, test);
});

compiler.registerNesting('>', function (test) {
  return directParent.bind(null, test);
});

function findAll(inst, test) {
  var getParent = arguments.length <= 2 || arguments[2] === undefined ? function () {
    return { parent: null };
  } : arguments[2];
  var excludeSelf = arguments.length <= 3 || arguments[3] === undefined ? true : arguments[3];

  var found = [];

  if (!inst || !inst.getPublicInstance) return found;

  var publicInst = inst.getPublicInstance(),
      element = inst._currentElement,
      parent = function parent() {
    return { parent: element, getParent: getParent };
  };

  if (!excludeSelf && test(element, inst, getParent)) found = found.concat(inst);

  if (ReactTestUtils.isDOMComponent(publicInst)) {
    (function () {
      var renderedChildren = inst._renderedChildren || {};

      Object.keys(renderedChildren).forEach(function (key) {
        found = found.concat(findAll(renderedChildren[key], test, parent, false));
      });
    })();
  } else if (_utils.isCompositeComponent(publicInst)) {
    found = found.concat(findAll(inst._renderedComponent, test, parent, false));
  }

  return found;
}

function anyParent(test, element, inst, parentNode) {
  do {
    var _parentNode = parentNode();

    var getParent = _parentNode.getParent;
    var parent = _parentNode.parent;

    element = parent;
    parentNode = getParent;
  } while (element && !test(element, test, getParent));

  return !!element;
}

function directParent(test, element, inst, parentNode) {
  element = parentNode().parent;
  return !!(element && test(element, parentNode().getParent));
}

function match(selector, inst) {
  var includeSelf = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  var tree = inst.getPublicInstance ? inst : ReactInstanceMap.get(inst);

  return findAll(tree, compiler.compile(selector), undefined, !includeSelf);
}

var compile = compiler.compile;
var compileRule = compiler.compileRule;
var selector = compiler.selector;
exports.compile = compile;
exports.compileRule = compileRule;
exports.selector = selector;