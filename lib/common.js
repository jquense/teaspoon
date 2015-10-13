'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj['default'] = obj; return newObj; } }

var _utils = require('./utils');

var utils = _interopRequireWildcard(_utils);

exports['default'] = function ($) {

  _extends($, {
    dom: function dom(component) {
      return utils.findDOMNode(component);
    }
  });

  _extends($.fn, {
    _subjects: $.fn.get,

    _reduce: $.fn.reduce,

    _map: function _map(cb) {
      var result = [];
      this.each(function () {
        return result.push(cb.apply(undefined, arguments));
      });
      return result;
    },

    each: function each(cb, thisArg) {
      var idx = -1,
          len = this.length;
      while (++idx < len) cb.call(thisArg, this[idx], idx, this);
      return this;
    },

    get: function get() {
      var result = [];
      this.each(function (el) {
        return result.push(el);
      });
      return result;
    },

    reduce: function reduce(cb, initial) {
      return $([].reduce.call(this, cb, initial), this);
    },

    map: function map(cb) {
      return this.reduce(function (result) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        result.push(cb.apply(undefined, args));
        return result;
      }, []);
    },

    find: function find(selector) {
      return this._reduce(function (result, element) {
        return result.concat($.match(selector, element, false));
      }, []);
    },

    traverse: function traverse(test) {
      return this._reduce(function (result, element) {
        return result.concat(utils.traverse(element, test));
      }, []);
    },

    filter: function filter(selector) {
      if (!selector) return this;

      var matches = $.match(selector, this.context, true);

      return this._reduce(function (result, element) {
        if (matches.indexOf(element) !== -1) result.push(element);

        return result;
      }, []);
    },

    is: function is(selector) {
      return this.filter(selector).length === this.length;
    },

    first: function first(selector) {
      return selector ? this.find(selector).first() : $(this[0], this);
    },

    last: function last(selector) {
      return selector ? this.find(selector).last() : $(this[this.length - 1], this);
    },

    only: function only() {
      if (this.length !== 1) throw new Error('The query found: ' + this.length + ' items not 1 ');

      return this.first();
    },

    single: function single(selector) {
      return selector ? this.find(selector).only() : this.only();
    }
  });
};

module.exports = exports['default'];