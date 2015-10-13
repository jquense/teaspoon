'use strict';

exports.__esModule = true;
var _bind = Function.prototype.bind;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

exports['default'] = function (match, selector, init) {

  function QueryCollection() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new (_bind.apply(QueryCollection.fn.init, [null].concat(args)))();
  }

  _extends(QueryCollection, {
    match: match,
    selector: selector,
    s: selector,
    isQueryCollection: function isQueryCollection(inst) {
      return !!inst._isQueryCollection;
    }
  });

  QueryCollection.fn = QueryCollection.prototype = {
    constructor: QueryCollection
  };

  createInit(QueryCollection);
  _common2['default'](QueryCollection);

  return QueryCollection;

  function createInit($) {

    $.fn.init = function $init(element, context) {
      var _this = this;

      var elements = element == null ? [] : [].concat(element);

      if ($.isQueryCollection(element)) {
        return new element.constructor(element.get(), element.context);
      } else {
        this.context = context && context.context || context || element;

        for (var _len2 = arguments.length, args = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
          args[_key2 - 2] = arguments[_key2];
        }

        elements = init.call.apply(init, [this, elements, context].concat(args));
      }

      if ($.isQueryCollection(elements)) return elements;

      elements.forEach(function (el, idx) {
        return _this[idx] = el;
      });

      this._isQueryCollection = true;
      this.length = elements.length;
    };

    $.fn.init.prototype = $.fn;
  }
};

module.exports = exports['default'];