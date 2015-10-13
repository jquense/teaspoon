'use strict';

exports.__esModule = true;
exports.isCompositeComponent = isCompositeComponent;
exports.getInstances = getInstances;
exports.getInternalInstance = getInternalInstance;
exports.wrapStateless = wrapStateless;
exports.getMountPoint = getMountPoint;
exports.getRootInstance = getRootInstance;
exports.findDOMNode = findDOMNode;
exports.getInstanceChildren = getInstanceChildren;
exports.match = match;
exports.traverse = traverse;

var _templateObject = _taggedTemplateLiteralLoose(['', ''], ['', '']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactLibReactInstanceMap = require('react/lib/ReactInstanceMap');

var _reactLibReactInstanceMap2 = _interopRequireDefault(_reactLibReactInstanceMap);

var _reactLibReactMount = require('react/lib/ReactMount');

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _domHelpersQueryClosest = require('dom-helpers/query/closest');

var _domHelpersQueryClosest2 = _interopRequireDefault(_domHelpersQueryClosest);

var _bill = require('bill');

var _billInstanceSelector = require('bill/instance-selector');

var _billElementSelector = require('bill/element-selector');

var isDOMComponent = _reactAddonsTestUtils2['default'].isDOMComponent;

exports.isDOMComponent = isDOMComponent;

function isCompositeComponent(inst) {
  if (_reactAddonsTestUtils2['default'].isDOMComponent(inst)) {
    // Accessing inst.setState warns; just return false as that'll be what
    // this returns when we have DOM nodes as refs directly
    return false;
  }
  return inst === null || typeof inst.render === 'function' && typeof inst.setState === 'function';
}

function getInstances(component) {
  var _public = component,
      _private = getInternalInstance(component);

  if (component.getPublicInstance) {
    _public = component.getPublicInstance();

    //stateless
    if (_public === null) _public = _reactDom2['default'].findDOMNode(_private._instance);
  }
  // if this a root Stateless component
  else if (component.__isStatelessWrapper) _public = _reactDom2['default'].findDOMNode(component);

  return { 'private': _private, 'public': _public };
}

function getInternalInstance(component) {
  if (!component) return;

  if (component.getPublicInstance) return component;

  if (component.__isStatelessWrapper) return _reactLibReactInstanceMap2['default'].get(component)._renderedComponent;

  if (component._reactInternalComponent) return component._reactInternalComponent;

  return _reactLibReactInstanceMap2['default'].get(component);
}

function wrapStateless(Element) {
  var StatelessWrapper = (function (_React$Component) {
    _inherits(StatelessWrapper, _React$Component);

    function StatelessWrapper() {
      _classCallCheck(this, StatelessWrapper);

      _React$Component.call(this);
      this.__isStatelessWrapper = true;
    }

    StatelessWrapper.prototype.render = function render() {
      return Element;
    };

    return StatelessWrapper;
  })(_react2['default'].Component);

  return _react2['default'].createElement(StatelessWrapper, null);
}

function getMountPoint(instance) {
  var id = _reactLibReactMount.getID(findDOMNode(instance));
  return _reactLibReactMount.findReactContainerForID(id);
}

function getRootInstance(mountPoint) {
  return _reactLibReactMount._instancesByReactRootID[_reactLibReactMount.getReactRootID(mountPoint)];
}

function findDOMNode(component) {
  return component instanceof HTMLElement ? component : component && component._rootID ? _reactLibReactMount.getNode(component._rootID) : _reactDom2['default'].findDOMNode(component);
}

function getInstanceChildren(inst) {
  var publicInst = undefined;

  if (!inst) return [];

  if (inst.getPublicInstance) publicInst = inst.getPublicInstance();

  if (_reactAddonsTestUtils2['default'].isDOMComponent(publicInst)) {
    var _ret = (function () {
      var renderedChildren = inst._renderedChildren || {};

      return {
        v: Object.keys(renderedChildren).map(function (key) {
          return renderedChildren[key];
        }).filter(function (node) {
          return typeof node._currentElement !== 'string';
        })
      };
    })();

    if (typeof _ret === 'object') return _ret.v;
  } else if (isCompositeComponent(publicInst)) {
    var rendered = inst._renderedComponent;
    if (rendered && typeof rendered._currentElement !== 'string') return [rendered];
  }

  return [];
}

function match(selector, tree, includeSelf) {
  if (typeof selector === 'function') selector = _bill.selector(_templateObject, selector);

  return _bill.match(selector, tree, includeSelf);
}

function traverse(tree, test) {
  var includeSelf = arguments.length <= 2 || arguments[2] === undefined ? true : arguments[2];

  if (_react2['default'].isValidElement(tree)) return _billElementSelector.findAll(tree, test, includeSelf);

  return _billInstanceSelector.findAll(tree, test, includeSelf);
}