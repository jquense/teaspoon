'use strict';

var _templateObject = _taggedTemplateLiteralLoose(['', ''], ['', '']);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _taggedTemplateLiteralLoose(strings, raw) { strings.raw = raw; return strings; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactLibReactInstanceMap = require('react/lib/ReactInstanceMap');

var _reactLibReactInstanceMap2 = _interopRequireDefault(_reactLibReactInstanceMap);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _instanceSelector = require('./instance-selector');

var _domHelpersClassHasClass = require('dom-helpers/class/hasClass');

var _domHelpersClassHasClass2 = _interopRequireDefault(_domHelpersClassHasClass);

var $r = module.exports = rtq;

var isRtq = function isRtq(item) {
  return item && item._isRTQ;
};

rtq.react = _react2['default'];
rtq.s = rtq.selector = _instanceSelector.selector;

function rtq(element, mount) {
  var renderIntoDocument = arguments.length <= 2 || arguments[2] === undefined ? mount === true : arguments[2];
  return (function () {
    var context;

    if (!mount || mount === true) mount = document.createElement('div');

    if (_reactAddonsTestUtils2['default'].isElement(element)) context = element = render(element, mount, renderIntoDocument);else if (_reactAddonsTestUtils2['default'].isDOMComponent(element) || _reactAddonsTestUtils2['default'].isCompositeComponent(element)) {
      context = element;
      mount = rtq.dom(element).parentNode;
    } else if (isRtq(element)) {
      mount = element._mountPoint;
      context = element.context;
      element = element.get();
    } else throw new TypeError('Wrong type: must either be ReactElement or a Component Instance');

    return new ComponentCollection(element, context, mount);
  })();
}

function render(element, mountPoint) {
  var renderIntoDocument = arguments.length <= 2 || arguments[2] === undefined ? false : arguments[2];

  var mount = mountPoint;

  if (renderIntoDocument) document.body.appendChild(mount);

  var instance = _reactDom2['default'].render(element, mount);

  if (instance === null) {
    instance = _reactDom2['default'].render(wrapStateless(element), mount);
  }

  if (!instance.renderWithProps) {
    instance.renderWithProps = function (newProps) {
      return render(_react2['default'].cloneElement(element, newProps), mount, renderIntoDocument);
    };
  }

  return instance;
}

function match(selector, tree, includeSelf) {
  if (typeof selector === 'function') selector = _instanceSelector.selector(_templateObject, selector);

  return _instanceSelector.match(selector, tree, includeSelf);
}

rtq.dom = function (component) {
  return component instanceof HTMLElement ? component : _reactDom2['default'].findDOMNode(component);
};

var ComponentCollection = (function () {
  function ComponentCollection(_components, context, mountPoint, selector) {
    _classCallCheck(this, ComponentCollection);

    var components = _components == null ? [] : [].concat(_components),
        idx = -1,
        len = components.length;

    this._privateInstances = Object.create(null);

    while (++idx < len) {
      var component = components[idx];

      if (component.getPublicInstance) {
        this._privateInstances[idx] = component;
        component = component.getPublicInstance();

        //stateless
        if (component === null) component = _reactDom2['default'].findDOMNode(this._privateInstances[idx]._instance);
      }
      // if this a root Stateless component
      else if (component && component.__isRTQstatelessWrapper) {
          var wrapperInstance = _reactLibReactInstanceMap2['default'].get(component);
          this._privateInstances[idx] = wrapperInstance._renderedComponent;
          component = _reactDom2['default'].findDOMNode(component);
        } else {
          this._privateInstances[idx] = _reactLibReactInstanceMap2['default'].get(component) || component._reactInternalComponent;
        }

      this[idx] = component;
    }

    this.length = len;
    this.context = context;
    this.selector = selector;
    this._mountPoint = mountPoint;
    this._isRTQ = true;
  }

  ComponentCollection.prototype._root = function _root() {
    return this.context._reactInternalComponent || this.context;
  };

  ComponentCollection.prototype.unmount = function unmount() {
    var inBody = !!this.context.parentNode;
    _reactDom2['default'].unmountComponentAtNode(this._mountPoint);

    if (inBody) document.body.removeChild(this._mountPoint);

    this.context = null;
  };

  ComponentCollection.prototype.setProps = function setProps(newProps) {
    return this.mapInPlace(function (element) {
      return element.renderWithProps(newProps);
    });
  };

  ComponentCollection.prototype.each = function each(cb, thisArg) {
    var idx = -1,
        len = this.length;
    while (++idx < len) cb.call(thisArg, this[idx], idx, this);
    return this;
  };

  ComponentCollection.prototype.mapInPlace = function mapInPlace(cb, thisArg) {
    var _this = this;

    return this.each(function (el, idx, list) {
      return _this[idx] = cb(el, idx, list);
    });
  };

  ComponentCollection.prototype.map = function map(cb, thisArg) {
    var idx = -1,
        len = this.length,
        result = [];
    while (++idx < len) result.push(cb.call(thisArg, this[idx], idx, this));
    return result;
  };

  ComponentCollection.prototype._reduce = function _reduce(cb, initial) {
    return new ComponentCollection(this._getInstances().reduce(cb, initial), this.context, this._mountPount, this.selector);
  };

  ComponentCollection.prototype.reduce = function reduce(cb, initial) {
    return new ComponentCollection([].reduce.call(this, cb, initial), this.context, this._mountPount, this.selector);
  };

  ComponentCollection.prototype._getInstances = function _getInstances() {
    var _this2 = this;

    return this.map(function (_, idx) {
      return _this2._privateInstances[idx];
    });
  };

  ComponentCollection.prototype.get = function get() {
    return unwrap(this.map(function (component) {
      return component;
    }));
  };

  ComponentCollection.prototype.dom = function dom() {
    return unwrap(this.map(rtq.dom));
  };

  ComponentCollection.prototype.find = function find(selector) {
    return this._reduce(function (result, instance) {
      return result.concat(match(selector, instance, false));
    }, []);
  };

  ComponentCollection.prototype.filter = function filter(selector) {
    if (!selector) return this;

    var matches = match(selector, this._root());

    return this._reduce(function (result, el) {
      return matches.indexOf(el) !== -1 ? result.concat(el) : result;
    }, []);
  };

  ComponentCollection.prototype.only = function only() {
    if (this.length !== 1) throw Error('`' + this.selector + '` found: ' + this.length + ' not 1 ');
    return this.first();
  };

  ComponentCollection.prototype.single = function single(selector) {
    return selector ? this.find(selector).only() : this.only();
  };

  ComponentCollection.prototype.first = function first(selector) {
    return selector ? this.find(selector).first() : new ComponentCollection(this[0], this.context, this._mountPount, this.selector);
  };

  ComponentCollection.prototype.last = function last(selector) {
    return selector ? this.find(selector).last() : new ComponentCollection(this[this.length - 1], this.context, this._mountPount, this.selector);
  };

  ComponentCollection.prototype.is = function is(selector) {
    return this.filter(selector).length === this.length;
  };

  ComponentCollection.prototype.trigger = function trigger(event, data) {
    data = data || {};

    if (event.substr(0, 2) === 'on') event = event.substr(2, 1).toLowerCase() + event.substr(3);

    if (!(event in _reactAddonsTestUtils2['default'].Simulate)) throw new TypeError('"' + event + '" is not a supported DOM event');

    return this.each(function (component) {
      return _reactAddonsTestUtils2['default'].Simulate[event]($r.dom(component), data);
    });
  };

  return ComponentCollection;
})();

function unwrap(arr) {
  return arr && arr.length === 1 ? arr[0] : arr;
}

function wrapStateless(Element) {
  var StatelessWrapper = (function (_React$Component) {
    _inherits(StatelessWrapper, _React$Component);

    function StatelessWrapper() {
      _classCallCheck(this, StatelessWrapper);

      _React$Component.call(this);
      this.__isRTQstatelessWrapper = true;
    }

    StatelessWrapper.prototype.render = function render() {
      return Element;
    };

    return StatelessWrapper;
  })(_react2['default'].Component);

  return _react2['default'].createElement(StatelessWrapper, null);
}