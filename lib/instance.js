'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactLibReactUpdateQueue = require('react/lib/ReactUpdateQueue');

var _reactLibReactUpdateQueue2 = _interopRequireDefault(_reactLibReactUpdateQueue);

var _reactLibReactInstanceMap = require('react/lib/ReactInstanceMap');

var _reactLibReactInstanceMap2 = _interopRequireDefault(_reactLibReactInstanceMap);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _domHelpersQueryClosest = require('dom-helpers/query/closest');

var _domHelpersQueryClosest2 = _interopRequireDefault(_domHelpersQueryClosest);

var _QueryCollection = require('./QueryCollection');

var _QueryCollection2 = _interopRequireDefault(_QueryCollection);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _bill = require('bill');

var _bill2 = _interopRequireDefault(_bill);

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var assertLength = utils.assertLength;
var assertRoot = utils.assertRoot;
var assertStateful = utils.assertStateful;
var collectArgs = utils.collectArgs;

var createCallback = function createCallback(collection, fn) {
  return function () {
    return fn.call(collection, collection);
  };
};

function getSetterMethod(key) {
  return function () {
    var _utils$render;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var value = collectArgs.apply(undefined, args);
    var node = assertLength(this, key).nodes[0];
    var data = node.instance && node.instance[key];

    if (args.length === 0 || typeof value === 'string' && args.length === 1) {
      if (!data) data = node.privateInstance._currentElement[key];

      return value && data ? data[value] : data;
    }

    var _utils$render2 = utils.render(this, null, (_utils$render = {}, _utils$render[key] = _extends({}, data, value), _utils$render));

    var instance = _utils$render2.instance;

    utils.attachElementsToCollection(this, instance);
    return this;
  };
}

var $ = _QueryCollection2['default'](function (element, lastCollection) {
  var first = this.nodes[0];

  if (!lastCollection) {
    try {
      // no idea if I can do this in 0.15
      this._mountPoint = utils.getMountPoint(first.instance);
    } catch (err) {}
  } else this._mountPoint = lastCollection._mountPoint;
});

_extends($.fn, {

  render: function render() {
    var collection = new _element2['default'](this.elements()[0]);

    return collection.render.apply(collection, arguments);
  },

  shallowRender: function shallowRender() {
    var collection = new _element2['default'](this.elements()[0]);

    return collection.shallowRender.apply(collection, arguments);
  },

  unmount: function unmount() {
    var inBody = this._mountPoint.parentNode,
        nextContext = this.root.nodes[0].element;

    _reactDom2['default'].unmountComponentAtNode(this._mountPoint);

    if (inBody) document.body.removeChild(this._mountPoint);

    this.root = null;

    return _element2['default'](nextContext);
  },

  dom: function dom() {
    return unwrap(this._map(utils.findDOMNode));
  },

  props: getSetterMethod('props'),

  context: getSetterMethod('context'),

  state: function state() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var value = collectArgs.apply(undefined, args),
        callback = args[2] || args[1];

    var node = assertStateful(assertLength(this, 'state').nodes[0]);

    if (args.length === 0 || typeof value === 'string' && args.length === 1) {
      var key = value,
          state = node.instance.state;

      return key && state ? state[key] : state;
    }

    callback = typeof callback === 'function' ? createCallback(this, callback) : undefined;

    node.instance.setState(value, callback);

    return this;
  },

  trigger: function trigger(event, data) {
    data = data || {};

    if (event.substr(0, 2) === 'on') event = event.substr(2, 1).toLowerCase() + event.substr(3);

    if (!(event in _reactAddonsTestUtils2['default'].Simulate)) throw new TypeError('"' + event + '" is not a supported DOM event');

    return this.each(function (component) {
      return _reactAddonsTestUtils2['default'].Simulate[event](utils.findDOMNode(component), data);
    });
  }
});

function unwrap(arr) {
  return arr && arr.length === 1 ? arr[0] : arr;
}

exports['default'] = $;
module.exports = exports['default'];