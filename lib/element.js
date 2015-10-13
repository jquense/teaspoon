'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _QueryCollection = require('./QueryCollection');

var _QueryCollection2 = _interopRequireDefault(_QueryCollection);

var _instance = require('./instance');

var _instance2 = _interopRequireDefault(_instance);

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var _bill = require('bill');

var isComponent = function isComponent(el) {
  return utils.isDOMComponent(el) || utils.isCompositeComponent(el);
};

var eQuery = _QueryCollection2['default'](utils.match, _bill.selector, function init(elements, context) {
  var first = elements.filter(function (e) {
    return !!e;
  })[0];
  if (first && isComponent(first)) return _instance2['default'](elements);

  return elements.filter(function (el) {
    return _react.isValidElement(el);
  });
});

_extends(eQuery.fn, {

  _reduce: eQuery.fn.reduce,

  render: function render(intoDocument, mountPoint) {
    var mount = mountPoint || document.createElement('div'),
        element = this[0];

    if (intoDocument) document.body.appendChild(mount);

    var instance = _reactDom2['default'].render(element, mount);

    if (instance === null) instance = _reactDom2['default'].render(utils.wrapStateless(element), mount);

    return _instance2['default'](instance, utils.getInternalInstance(instance), mount);
  },

  shallowRender: function shallowRender(props) {
    if (!this.length) return this;

    var element = this[0];
    var isDomElement = typeof element.type === 'string' && element.type.toLowerCase() === element.type;

    if (props) element = _react.cloneElement(element, props);

    if (isDomElement) return eQuery(element);

    var renderer = _reactAddonsTestUtils2['default'].createRenderer();
    renderer.render(element);
    return eQuery(renderer.getRenderOutput());
  },

  children: function children(selector) {
    return this.reduce(function (result, element) {
      return result.concat(element.props.children || []);
    }, []).filter(selector);
  },

  text: function text() {
    var isText = function isText(el) {
      return typeof el === 'string';
    };

    return this.get().reduce(function (str, element) {
      return str + utils.traverse(element, isText).join('');
    }, '');
  }

});

exports['default'] = eQuery;
module.exports = exports['default'];