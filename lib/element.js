'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactAddonsTestUtils = require('react-addons-test-utils');

var _reactAddonsTestUtils2 = _interopRequireDefault(_reactAddonsTestUtils);

var _QueryCollection = require('./QueryCollection');

var _QueryCollection2 = _interopRequireDefault(_QueryCollection);

var _instance2 = require('./instance');

var _instance3 = _interopRequireDefault(_instance2);

var _utils = require('./utils');

var _billNode = require('bill/node');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var createCallback = function createCallback(collection, fn) {
  return function () {
    return fn.call(collection, collection);
  };
};

function getShallowInstance(renderer) {
  return renderer && renderer._instance._instance;
}

function getShallowTreeWithRoot(renderer) {
  var children = renderer.getRenderOutput(),
      instance = getShallowInstance(renderer),
      element = _billNode.createNode(instance).element;

  return _react2['default'].cloneElement(element, { children: children });
}

function spyOnUpdate(inst, fn) {
  if (!inst) return;
  var didUpdate = inst.componentDidUpdate;

  inst.componentDidUpdate = function () {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    fn.apply(this, args);
    didUpdate && didUpdate.apply(this, args);
  };
}

var $ = _QueryCollection2['default'](function (elements, lastCollection) {
  if (lastCollection) {
    this._rendered = lastCollection._rendered;
  }
});

_extends($.fn, {

  _instance: function _instance() {
    return getShallowInstance(this._renderer);
  },

  render: function render(intoDocument, mountPoint, context) {
    if (arguments.length && typeof intoDocument !== 'boolean') {
      context = mountPoint;
      mountPoint = intoDocument;
      intoDocument = false;
    }

    if (mountPoint && !(mountPoint instanceof window.HTMLElement)) {
      context = mountPoint;
      mountPoint = null;
    }

    var mount = mountPoint || document.createElement('div'),
        element = _utils.assertLength(this, 'render')[0];

    if (intoDocument) document.body.appendChild(mount);

    if (_defaults2['default'].context && context) context = _extends({}, _defaults2['default'].context, context);

    var _render2 = _utils.render(element, mount, {
      context: context || _defaults2['default'].context
    });

    var instance = _render2.instance;
    var wrapper = _render2.wrapper;

    var collection = _instance3['default'](instance);

    collection._mountPoint = mount;
    collection._rootWrapper = wrapper;
    return collection;
  },

  shallowRender: function shallowRender(props, context) {
    if (!this.length) return this;

    var element = this[0];
    var isDomElement = typeof element.type === 'string';

    if (props) element = _react.cloneElement(element, props);

    if (isDomElement) return $(element);

    var renderer = _reactAddonsTestUtils2['default'].createRenderer();

    if (_defaults2['default'].context && context) context = _extends({}, _defaults2['default'].context, context);

    renderer.render(element, context || _defaults2['default'].context);

    var collection = $(getShallowTreeWithRoot(renderer));

    collection._rendered = true;
    collection._renderer = renderer;

    spyOnUpdate(collection._instance(), function () {
      return collection.update();
    });

    return collection;
  },

  update: function update() {
    _utils.assertRoot(this);
    if (!this._renderer) throw new Error('You can only preform this action on a "root" element.');

    _utils.attachElementsToCollection(this, getShallowTreeWithRoot(this._renderer));
    return this;
  },

  props: function props() {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    var value = _utils.collectArgs.apply(undefined, args);
    var node = _utils.assertLength(this, 'props').nodes[0];

    if (args.length === 0 || typeof value === 'string' && args.length === 1) {
      var element = node.element;
      return value ? element.props[value] : element.props;
    }

    if (this._rendered) {
      _utils.assertRoot(this, 'changing the props on a shallow rendered child is an anti-pattern, ' + 'since the elements props will be overridden by its parent in the next update() of the root element');

      this._renderer.render(_react2['default'].cloneElement(this[0], value));
      _utils.attachElementsToCollection(this, getShallowTreeWithRoot(this._renderer));
      return this;
    }

    return this.map(function (el) {
      return _react2['default'].isValidElement(el) ? _react2['default'].cloneElement(el, value) : el;
    });
  },

  state: function state() {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    var value = _utils.collectArgs.apply(undefined, args),
        callback = args[2] || args[1];

    _utils.assertLength(this, 'state');
    _utils.assertStateful(this.nodes[0]);

    _invariant2['default'](this._rendered, 'Only rendered trees can be stateful; ' + 'use either `shallowRender` or `render` first before inspecting or setting state.');

    _utils.assertRoot(this, 'Only the root component of shallowly rendered tree is instantiated; ' + 'children elements are stateless so inspecting or setting state on them does\'t make sense ' + 'use DOM rendering to verifying child state, or select and shallowRender the child itself.');

    if (args.length === 0 || typeof value === 'string' && args.length === 1) {
      var key = value,
          state = this._instance().state;

      return key && state ? state[key] : state;
    }

    callback = typeof callback === 'function' ? createCallback(this, callback) : undefined;

    this._instance().setState(value, callback);

    return this;
  },

  context: function context() {
    for (var _len4 = arguments.length, args = Array(_len4), _key4 = 0; _key4 < _len4; _key4++) {
      args[_key4] = arguments[_key4];
    }

    var value = _utils.collectArgs.apply(undefined, args);
    var inst = _utils.assertLength(this, 'context')._instance();
    var context = inst.context;

    _invariant2['default'](this._rendered, 'Only rendered trees can pass context; ' + 'use either `shallowRender` or `render` first before inspecting or setting context.');

    _utils.assertRoot(this, 'Only the root component of a shallowly rendered tree is instantiated; ' + 'The children are jsut plain elements and are not passed context.');

    if (args.length === 0 || typeof value === 'string' && args.length === 1) {
      return value && context ? context[value] : context;
    }

    this._renderer.render(this[0], _extends({}, context, value));
    _utils.attachElementsToCollection(this, getShallowTreeWithRoot(this._renderer));

    return this;
  },

  trigger: function trigger(event) {
    for (var _len5 = arguments.length, args = Array(_len5 > 1 ? _len5 - 1 : 0), _key5 = 1; _key5 < _len5; _key5++) {
      args[_key5 - 1] = arguments[_key5];
    }

    if (event.indexOf('on') !== 0) event = 'on' + event[0].toUpperCase() + event.substr(1);

    return this.each(function (component) {
      var _component$props;

      component.props[event] && (_component$props = component.props)[event].apply(_component$props, args);
    });
  }

});

exports['default'] = $;
module.exports = exports['default'];