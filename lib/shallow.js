'use strict';

exports.__esModule = true;

var _templateObject = _taggedTemplateLiteralLoose(['', ''], ['', '']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _bill = require('bill');

var isRtq = function isRtq(item) {
  return item && item.__isRTQ;
};

rtq.s = rtq.selector = _bill.selector;

exports['default'] = rtq;

function match(selector, tree, includeSelf) {
  if (typeof selector === 'function') selector = _bill.selector(_templateObject, selector);

  return _bill.match(selector, tree, includeSelf);
}

function render(element) {
  var root = element;

  if (!(typeof root.type === 'string' && root.type.toLowerCase() === root.type)) {
    var renderer = _reactAddonsTestUtils2['default'].createRenderer();
    renderer.render(element);
    root = renderer.getRenderOutput();
  }

  return {
    root: root,
    setProps: function setProps(props) {
      return render(_react.cloneElement(element, props));
    }
  };
}

function rtq(element) {
  var context, rerender;

  if (_reactAddonsTestUtils2['default'].isElement(element)) {
    var _render = render(element);

    var root = _render.root;
    var setProps = _render.setProps;

    element = context = root;
    rerender = setProps;
  } else if (isRtq(element)) {
    context = element.root;
    element = element.get();
  }

  return new ShallowCollection(element, context, rerender);
}

var ShallowCollection = (function () {
  function ShallowCollection(elements, root, rerender) {
    _classCallCheck(this, ShallowCollection);

    elements = [].concat(elements).filter(function (el) {
      return _react.isValidElement(el);
    });

    var idx = -1;

    while (++idx < elements.length) this[idx] = elements[idx];

    this._rerender = rerender;
    this.length = elements.length;
    this.root = root;
  }

  ShallowCollection.prototype.setProps = function setProps(props) {
    this._rerender && this._rerender(props);
    return this;
  };

  ShallowCollection.prototype.each = function each(cb) {
    var idx = -1,
        len = this.length;
    while (++idx < len) cb(this[idx], idx, this);
    return this;
  };

  ShallowCollection.prototype.get = function get() {
    var result = [];
    this.each(function (el) {
      return result.push(el);
    });
    return result;
  };

  ShallowCollection.prototype.reduce = function reduce(cb, initial) {
    return new ShallowCollection([].reduce.call(this, cb, initial), this.root);
  };

  ShallowCollection.prototype.map = function map(cb) {
    var result = [];
    this.each(function (v, i, l) {
      return result.push(cb(v, i, l));
    });

    return new ShallowCollection(result, this.root);
  };

  ShallowCollection.prototype.find = function find(selector) {
    return this.reduce(function (result, element) {
      return result.concat(match(selector, element));
    }, []);
  };

  ShallowCollection.prototype.children = function children(selector) {
    return this.reduce(function (result, element) {
      return result.concat(element.props.children || []);
    }, []).filter(selector);
  };

  ShallowCollection.prototype.filter = function filter(selector) {
    if (!selector) return this;

    var matches = match(selector, this.root);

    return new ShallowCollection([].filter.call(this, function (el) {
      return matches.indexOf(el) !== -1;
    }), this.root);
  };

  ShallowCollection.prototype.is = function is(selector) {
    return this.filter(selector).length === this.length;
  };

  ShallowCollection.prototype.first = function first(selector) {
    return selector ? this.find(selector).first() : new ShallowCollection(this[0], this.root);
  };

  ShallowCollection.prototype.last = function last(selector) {
    return selector ? this.find(selector).last() : new ComponentCollection(this[this.length - 1], this.root);
  };

  ShallowCollection.prototype.text = function text() {
    var str = '';

    this.each(function (element) {
      return traverse(element, function (el) {
        return typeof el === 'string' && (str += el);
      });
    });
    return str;
  };

  return ShallowCollection;
})();

function traverse(element, cb) {
  cb(element);

  if (element && element.props) _react2['default'].Children.forEach(element.props.children, function (child) {
    traverse(child, cb);
  });
}
module.exports = exports['default'];