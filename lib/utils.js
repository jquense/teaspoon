'use strict';

exports.__esModule = true;
exports.getMountPoint = exports.isDOMComponent = exports.createShallowRenderer = exports.Simulate = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _templateObject = _taggedTemplateLiteralLoose(['', ''], ['', '']);

exports.assertLength = assertLength;
exports.assertStateful = assertStateful;
exports.assertRoot = assertRoot;
exports.render = render;
exports.collectArgs = collectArgs;
exports.isCompositeComponent = isCompositeComponent;
exports.isStatelessComponent = isStatelessComponent;
exports.isQueryCollection = isQueryCollection;
exports.unwrapAndCreateNode = unwrapAndCreateNode;
exports.attachElementsToCollection = attachElementsToCollection;
exports.getPublicInstances = getPublicInstances;
exports.getPublicInstance = getPublicInstance;
exports.wrapElement = wrapElement;
exports.getRootInstance = getRootInstance;
exports.findDOMNode = findDOMNode;
exports.matches = matches;
exports.qsa = qsa;

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _bill = require('bill');

var _bill2 = _interopRequireDefault(_bill);

var _compat = require('bill/compat');

var _node = require('bill/node');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var ReactTestUtils = require('react-dom/test-utils');
var ReactShallowRenderer = require('react-test-renderer/shallow');
var ReactMount = require('react-dom/lib/ReactMount');

var getID = ReactMount.getID,
    getNode = ReactMount.getNode,
    findReactContainerForID = ReactMount.findReactContainerForID,
    getReactRootID = ReactMount.getReactRootID,
    _instancesByReactRootID = ReactMount._instancesByReactRootID;
var Simulate = exports.Simulate = ReactTestUtils.Simulate;

var createShallowRenderer = exports.createShallowRenderer = function createShallowRenderer() {
  return new ReactShallowRenderer();
};

var isDOMComponent = exports.isDOMComponent = ReactTestUtils.isDOMComponent;

function assertLength(collection, method) {
  (0, _invariant2.default)(!!collection.length, 'the method `%s()` found no matching elements', method);
  return collection;
}

function assertStateful(node) {
  (0, _invariant2.default)(node.nodeType === _node.NODE_TYPES.COMPOSITE && !isStatelessComponent(node), 'You are trying to inspect or set state on a stateless component ' + 'such as a DOM node or functional component');

  return node;
}
function assertRoot(collection, msg) {
  (0, _invariant2.default)(!collection.root || collection.root === collection, msg || 'You can only preform this action on a "root" element.');
  return collection;
}

function render(element, mount, _ref, renderFn) {
  var props = _ref.props,
      context = _ref.context;

  var renderInstance = void 0,
      wrapper = void 0,
      prevWrapper = void 0;

  renderFn = renderFn || _reactDom2.default.render;

  if (isQueryCollection(element)) {
    var node = element.nodes[0];

    assertRoot(element);
    mount = element._mountPoint || mount;
    prevWrapper = element._rootWrapper;
    element = node.element;
  }

  if (props) element = _react2.default.cloneElement(element, props);

  if (context) {
    wrapper = element = wrapElement(element, context, prevWrapper);
    renderInstance = (0, _node.createNode)(wrapper).instance;
  }

  var instance = renderFn(element, mount);

  if (!renderInstance) renderInstance = instance;

  if (instance === null) {
    renderInstance = null;
    wrapper = wrapElement(element, null, prevWrapper);
    instance = renderFn(wrapper, mount);
  }

  if (wrapper) wrapper = wrapper.type;

  return { wrapper: wrapper, instance: instance, renderInstance: renderInstance };
}

function collectArgs(key, value) {
  if (typeof key === 'string') {
    var _key;

    if (arguments.length > 1) key = (_key = {}, _key[key] = value, _key);
  }

  return key;
}

function isCompositeComponent(inst) {
  if (ReactTestUtils.isDOMComponent(inst)) {
    // Accessing inst.setState warns; just return false as that'll be what
    // this returns when we have DOM nodes as refs directly
    return false;
  }
  return inst === null || typeof inst.render === 'function' && typeof inst.setState === 'function';
}

function isStatelessComponent(node) {
  var privInst = node.privateInstance;
  return privInst && privInst.getPublicInstance && privInst.getPublicInstance() === null;
}

function isQueryCollection(collection) {
  return !!(collection && collection._isQueryCollection);
}

function unwrapAndCreateNode(subject) {
  var node = (0, _node.createNode)(subject),
      inst = node.instance;

  if (inst && inst.__isTspWrapper) return unwrapAndCreateNode(node.children[0]);

  return node;
}

function attachElementsToCollection(collection, elements) {
  collection.nodes = [].concat(elements).filter(function (el) {
    return !!el;
  }).map(unwrapAndCreateNode);
  collection.length = collection.nodes.length;

  getPublicInstances(collection.nodes).forEach(function (el, idx) {
    return collection[idx] = el;
  });
}

function getPublicInstances(nodes) {
  var isInstanceTree = false;
  return nodes.map(function (node) {
    var privInst = node.privateInstance;

    (0, _invariant2.default)(!(isInstanceTree && !privInst && _react2.default.isValidElement(node.element)), 'Polymorphic collections are not allowed');
    isInstanceTree = !!privInst;
    return getPublicInstance(node);
  });
}

function getPublicInstance(node) {
  var privInst = node.privateInstance,
      inst = node.instance;

  if (!privInst) inst = node.element;else if (isStatelessComponent(node)) inst = _reactDom2.default.findDOMNode(privInst._instance);

  return inst;
}

/**
 * Wrap an element in order to provide context or an instance in the case of
 * stateless functional components. `prevWrapper` is necessary for
 * rerendering a wrapped root component, recreating a wrapper each time breaks
 * React reconciliation b/c `current.type !== prev.type`. Instead we reuse and
 * mutate (for childContextTypes) the original component type.
 */
function wrapElement(element, context, prevWrapper) {
  var TspWrapper = prevWrapper || function (_React$Component) {
    _inherits(_class, _React$Component);

    function _class() {
      _classCallCheck(this, _class);

      var _this = _possibleConstructorReturn(this, _React$Component.call(this));

      _this.__isTspWrapper = true;
      return _this;
    }

    _class.prototype.getChildContext = function getChildContext() {
      return this.props.context;
    };

    _class.prototype.render = function render() {
      return this.props.children;
    };

    return _class;
  }(_react2.default.Component);

  if (context) {
    TspWrapper.childContextTypes = Object.keys(context).reduce(function (t, k) {
      var _extends2;

      return _extends({}, t, (_extends2 = {}, _extends2[k] = function () {}, _extends2));
    }, {});
  }

  return _react2.default.createElement(
    TspWrapper,
    { context: context },
    element
  );
}

var getMountPoint = exports.getMountPoint = (0, _compat.ifDef)({
  '>=15.x.x': function getMountPoint(instance) {
    var privInst = (0, _node.createNode)(instance).privateInstance;
    var info = privInst._nativeContainerInfo || privInst._hostContainerInfo;
    var container = (0, _node.createNode)(info._topLevelWrapper);
    return findDOMNode(container.instance).parentNode;
  },
  '*': function getMountPoint(instance) {
    var id = getID(findDOMNode(instance));
    return findReactContainerForID(id);
  }
});

function getRootInstance(mountPoint) {
  return _instancesByReactRootID[getReactRootID(mountPoint)];
}

function findDOMNode(component) {
  return component instanceof window.HTMLElement ? component : component && component._rootID ? getNode(component._rootID) : component ? _reactDom2.default.findDOMNode(component) : null;
}

var buildSelector = function buildSelector(sel) {
  return typeof sel === 'function' ? _bill2.default.selector(_templateObject, sel) : sel;
};

function matches(selector, tree) {
  return !!_bill2.default.matches(buildSelector(selector), tree);
}

function qsa(selector, tree, includeSelf) {
  return _bill2.default.querySelectorAll(buildSelector(selector), tree, includeSelf);
}