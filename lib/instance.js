'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _QueryCollection = require('./QueryCollection');

var _QueryCollection2 = _interopRequireDefault(_QueryCollection);

var _utils = require('./utils');

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var createCallback = function createCallback(collection, fn) {
  return function () {
    return fn.call(collection, collection);
  };
};

function getSetterMethod(key) {
  return function () {
    var _render2;

    var value = _utils.collectArgs.apply(undefined, arguments);
    var node = (0, _utils.assertLength)(this, key).nodes[0];
    var data = node.instance && node.instance[key];

    if (arguments.length === 0 || typeof value === 'string' && arguments.length === 1) {
      if (!data) data = node.privateInstance._currentElement[key];

      return value && data ? data[value] : data;
    }

    var _render = (0, _utils.render)(this, null, (_render2 = {}, _render2[key] = _extends({}, data, value), _render2)),
        instance = _render.instance;

    (0, _utils.attachElementsToCollection)(this, instance);
    return this;
  };
}

var $ = (0, _QueryCollection2.default)(function (element, lastCollection) {
  var first = this.nodes[0];

  if (!lastCollection) {
    try {

      // no idea if I can do this in 0.15
      this._mountPoint = (0, _utils.getMountPoint)(first.instance);
    } catch (err) {} // eslint-disable-line
  } else this._mountPoint = lastCollection._mountPoint;
});

_extends($.fn, {
  render: function render() {
    var collection = new _element2.default(this.elements()[0]);

    return collection.render.apply(collection, arguments);
  },
  shallowRender: function shallowRender() {
    var collection = new _element2.default(this.elements()[0]);

    return collection.shallowRender.apply(collection, arguments);
  },
  unmount: function unmount() {
    var inBody = this._mountPoint.parentNode,
        nextContext = this.root.nodes[0].element;

    _reactDom2.default.unmountComponentAtNode(this._mountPoint);

    if (inBody) document.body.removeChild(this._mountPoint);

    this.root = null;

    return (0, _element2.default)(nextContext);
  },
  dom: function dom() {
    return unwrap(this._map(_utils.findDOMNode));
  },


  props: getSetterMethod('props'),

  context: getSetterMethod('context'),

  state: function state() {
    var value = _utils.collectArgs.apply(undefined, arguments),
        callback = (arguments.length <= 2 ? undefined : arguments[2]) || (arguments.length <= 1 ? undefined : arguments[1]);

    var node = (0, _utils.assertStateful)((0, _utils.assertLength)(this, 'state').nodes[0]);

    if (arguments.length === 0 || typeof value === 'string' && arguments.length === 1) {
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

    if (!(event in _utils.Simulate)) throw new TypeError('"' + event + '" is not a supported DOM event');

    return this.each(function (component) {
      return _utils.Simulate[event]((0, _utils.findDOMNode)(component), data);
    });
  }
});

function unwrap(arr) {
  return arr && arr.length === 1 ? arr[0] : arr;
}

exports.default = $;
module.exports = exports['default'];