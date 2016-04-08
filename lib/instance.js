'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _QueryCollection = require('./QueryCollection');

var _QueryCollection2 = _interopRequireDefault(_QueryCollection);

var _utils = require('./utils');

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var createCallback = function createCallback(collection, fn) {
  return function () {
    return fn.call(collection, collection);
  };
};

function getSetterMethod(key) {
  return function () {
    var _render;

    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    var value = _utils.collectArgs.apply(undefined, args);
    var node = _utils.assertLength(this, key).nodes[0];
    var data = node.instance && node.instance[key];

    if (args.length === 0 || typeof value === 'string' && args.length === 1) {
      if (!data) data = node.privateInstance._currentElement[key];

      return value && data ? data[value] : data;
    }

    var _render2 = _utils.render(this, null, (_render = {}, _render[key] = _extends({}, data, value), _render));

    var instance = _render2.instance;

    _utils.attachElementsToCollection(this, instance);
    return this;
  };
}

var $ = _QueryCollection2['default'](function (element, lastCollection) {
  var first = this.nodes[0];

  if (!lastCollection) {
    try {
      // no idea if I can do this in 0.15
      this._mountPoint = _utils.getMountPoint(first.instance);
    } catch (err) {} // eslint-disable-line
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
    return unwrap(this._map(_utils.findDOMNode));
  },

  props: getSetterMethod('props'),

  context: getSetterMethod('context'),

  state: function state() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var value = _utils.collectArgs.apply(undefined, args),
        callback = args[2] || args[1];

    var node = _utils.assertStateful(_utils.assertLength(this, 'state').nodes[0]);

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
      return _reactAddonsTestUtils2['default'].Simulate[event](_utils.findDOMNode(component), data);
    });
  }
});

function unwrap(arr) {
  return arr && arr.length === 1 ? arr[0] : arr;
}

exports['default'] = $;
module.exports = exports['default'];