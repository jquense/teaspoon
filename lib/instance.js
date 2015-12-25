'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

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

var $ = _QueryCollection2['default'](utils.match, _bill2['default'], function init(components, context, mount) {
  var _this = this;

  var first = components[0];

  mount = mount || context && context._mountPoint || utils.getMountPoint(first);

  this.context = context && context.context || context || utils.(utils.getRootInstance(mount));

  this._mountPoint = mount;
  this._privateInstances = Object.create(null);

  return components.map(function (component, idx) {
    var instances = utils.getInstances(component);
    _this._privateInstances[idx] = instances['private'];
    return instances['public'];
  });
});

_extends($, {
  dom: function dom(component) {
    return utils.findDOMNode(component);
  }
});

_extends($.fn, {

  _subjects: function _subjects() {
    var _this2 = this;

    return [].map.call(this, function (_, idx) {
      return _this2._privateInstances[idx];
    });
  },

  _reduce: function _reduce(cb, initial) {
    return $(this._subjects().reduce(cb, initial), this);
  },

  unmount: function unmount() {
    var inBody = this._mountPoint.parentNode,
        nextContext = this.context._currentElement;

    _reactDom2['default'].unmountComponentAtNode(this._mountPoint);

    if (inBody) document.body.removeChild(this._mountPoint);

    this.context = null;

    return _element2['default'](nextContext);
  },

  dom: function dom() {
    return unwrap(this._map($.dom));
  },

  text: function text() {
    var isText = function isText(el) {
      return typeof el === 'string';
    };

    return this._subjects().reduce(function (str, element) {
      return str + utils.traverse(element, isText).map(function (inst) {
        return inst._currentElement || inst;
      }).join('');
    }, '');
  },

  children: function children(selector) {
    return this._reduce(function (result, inst) {
      return result.concat(utils.getInstanceChildren(inst));
    }, []).filter(selector);
  },

  trigger: function trigger(event, data) {
    data = data || {};

    if (event.substr(0, 2) === 'on') event = event.substr(2, 1).toLowerCase() + event.substr(3);

    if (!(event in _reactAddonsTestUtils2['default'].Simulate)) throw new TypeError('"' + event + '" is not a supported DOM event');

    return this.each(function (component) {
      return _reactAddonsTestUtils2['default'].Simulate[event]($.dom(component), data);
    });
  }
});

function unwrap(arr) {
  return arr && arr.length === 1 ? arr[0] : arr;
}

exports['default'] = $;
module.exports = exports['default'];