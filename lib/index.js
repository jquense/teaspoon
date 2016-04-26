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

var _warning = require('warning');

var _warning2 = _interopRequireDefault(_warning);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _bill = require('bill');

var _billNode = require('bill/node');

var _utils = require('./utils');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var utils = _interopRequireWildcard(_utils);

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
  querySelectorAll: _utils.qsa,
  match: _utils.qsa,
  matches: _utils.matches,
  selector: _bill.selector,
  s: _bill.selector,
  isQueryCollection: utils.isQueryCollection,
  dom: utils.findDOMNode
});

$.element = _element2['default'];
$.instance = _instance2['default'];

$.registerPseudo = function (pseudo, isSelector, fn) {
  _warning2['default'](false, '`registerPseudo()` has been deprecated in favor of `createPseudo`');
  if (typeof isSelector === 'function') fn = isSelector, isSelector = true;

  _bill.registerPseudo(pseudo, function (value) {
    var test = isSelector ? _bill.compile(value) : value;
    return function (node) {
      return fn(node, test);
    };
  });
};

$.compileSelector = function (selector) {
  var matcher = _bill.compile(selector);
  return function (subject) {
    return utils.isQueryCollection(subject) ? subject.nodes.every(matcher) : matcher(subject);
  };
};

$.createPseudo = _bill.registerPseudo;

$.createPseudo('contains', function (text) {
  return function (node) {
    return ($(node).text() || '').indexOf(text) !== -1;
  };
});

$.createPseudo('textContent', function (text) {
  return function (node) {
    var textContent = node.children.filter(function (n) {
      return n.nodeType === _billNode.NODE_TYPES.TEXT;
    }).map(function (n) {
      return n.element;
    }).join('');

    return !text && !!textContent || text === textContent;
  };
});

$.defaultContext = function (obj) {
  _invariant2['default'](typeof obj === 'object', '[teaspoon]: Default context must be an object or null.');

  if (!obj || Object.keys(obj) === 0) obj = null;

  _defaults2['default'].context = obj;
};

module.exports = $;