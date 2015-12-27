'use strict';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _element = require('./element');

var _element2 = _interopRequireDefault(_element);

var _instance = require('./instance');

var _instance2 = _interopRequireDefault(_instance);

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

var _bill = require('bill');

var _billNode = require('bill/node');

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

var isComponent = function isComponent(el) {
  return utils.isDOMComponent(el) || utils.isCompositeComponent(el);
};
var $ = NodeCollection;

function NodeCollection(elements) {
  var first = [].concat(elements).filter(function (e) {
    return !!e;
  })[0],
      node = first && _billNode.createNode(first);

  if (node && node.privateInstance) return new _instance2['default'](elements);

  return new _element2['default'](elements);
}

$.fn = $.prototype = _common2['default'];

_extends($, {
  match: _utils.match,
  selector: _bill.selector,
  s: _bill.selector,
  isQueryCollection: utils.isQueryCollection,
  dom: utils.findDOMNode
});

$.element = _element2['default'];
$.instance = _instance2['default'];

$.registerPseudo = function (pseudo, isSelector, fn) {
  if (typeof isSelector === 'function') fn = isSelector, isSelector = true;

  _bill.registerPseudo(pseudo, isSelector, function (test) {
    return function (node) {
      return fn(node, test);
    };
  });
};

$.registerPseudo('contains', false, function (node, text) {
  return ($(node).text() || '').indexOf(text) !== -1;
});

$.registerPseudo('textContent', false, function (node, text) {
  var textContent = node.children.filter(function (n) {
    return n.nodeType === _billNode.NODE_TYPES.TEXT;
  }).map(function (n) {
    return n.element;
  }).join('');

  return !text && !!textContent || text === textContent;
});

module.exports = $;