'use strict';

exports.__esModule = true;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _QueryCollection = require('./QueryCollection');

var _QueryCollection2 = _interopRequireDefault(_QueryCollection);

var _instance2 = require('./instance');

var _instance3 = _interopRequireDefault(_instance2);

var _utils = require('./utils');

var _node = require('bill/node');

var _defaults = require('./defaults');

var _defaults2 = _interopRequireDefault(_defaults);

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      element = (0, _node.createNode)(instance).element;

  return _react2.default.cloneElement(element, { children: children });
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

var $ = (0, _QueryCollection2.default)(function (elements, lastCollection) {
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
        element = (0, _utils.assertLength)(this, 'render')[0];

    if (intoDocument) document.body.appendChild(mount);

    if (_defaults2.default.context && context) context = _extends({}, _defaults2.default.context, context);

    var _render2 = (0, _utils.render)(element, mount, {
      context: context || _defaults2.default.context
    }),
        instance = _render2.instance,
        wrapper = _render2.wrapper;

    var collection = (0, _instance3.default)(instance);

    collection._mountPoint = mount;
    collection._rootWrapper = wrapper;
    return collection;
  },
  shallowRender: function shallowRender(props, context) {
    if (!this.length) return this;

    var element = this[0];
    var isDomElement = typeof element.type === 'string';

    if (props) element = (0, _react.cloneElement)(element, props);

    if (isDomElement) return $(element);

    var renderer = (0, _utils.createShallowRenderer)();

    if (_defaults2.default.context && context) context = _extends({}, _defaults2.default.context, context);

    renderer.render(element, context || _defaults2.default.context);

    var collection = $(getShallowTreeWithRoot(renderer));

    collection._rendered = true;
    collection._renderer = renderer;

    spyOnUpdate(collection._instance(), function () {
      return collection.update();
    });

    return collection;
  },
  update: function update() {
    (0, _utils.assertRoot)(this);
    if (!this._renderer) throw new Error('You can only preform this action on a "root" element.');

    (0, _utils.attachElementsToCollection)(this, getShallowTreeWithRoot(this._renderer));
    return this;
  },
  props: function props() {
    var value = _utils.collectArgs.apply(undefined, arguments);
    var node = (0, _utils.assertLength)(this, 'props').nodes[0];

    if (arguments.length === 0 || typeof value === 'string' && arguments.length === 1) {
      var element = node.element;
      return value ? element.props[value] : element.props;
    }

    if (this._rendered) {
      (0, _utils.assertRoot)(this, 'changing the props on a shallow rendered child is an anti-pattern, ' + 'since the elements props will be overridden by its parent in the next update() of the root element');

      this._renderer.render(_react2.default.cloneElement(this[0], value));
      (0, _utils.attachElementsToCollection)(this, getShallowTreeWithRoot(this._renderer));
      return this;
    }

    return this.map(function (el) {
      return _react2.default.isValidElement(el) ? _react2.default.cloneElement(el, value) : el;
    });
  },
  state: function state() {
    var value = _utils.collectArgs.apply(undefined, arguments),
        callback = (arguments.length <= 2 ? undefined : arguments[2]) || (arguments.length <= 1 ? undefined : arguments[1]);

    (0, _utils.assertLength)(this, 'state');
    (0, _utils.assertStateful)(this.nodes[0]);

    (0, _invariant2.default)(this._rendered, 'Only rendered trees can be stateful; ' + 'use either `shallowRender` or `render` first before inspecting or setting state.');

    (0, _utils.assertRoot)(this, 'Only the root component of shallowly rendered tree is instantiated; ' + 'children elements are stateless so inspecting or setting state on them does\'t make sense ' + 'use DOM rendering to verifying child state, or select and shallowRender the child itself.');

    if (arguments.length === 0 || typeof value === 'string' && arguments.length === 1) {
      var key = value,
          state = this._instance().state;

      return key && state ? state[key] : state;
    }

    callback = typeof callback === 'function' ? createCallback(this, callback) : undefined;

    this._instance().setState(value, callback);

    return this;
  },
  context: function context() {
    var value = _utils.collectArgs.apply(undefined, arguments);
    var inst = (0, _utils.assertLength)(this, 'context')._instance();
    var context = inst.context;

    (0, _invariant2.default)(this._rendered, 'Only rendered trees can pass context; ' + 'use either `shallowRender` or `render` first before inspecting or setting context.');

    (0, _utils.assertRoot)(this, 'Only the root component of a shallowly rendered tree is instantiated; ' + 'The children are jsut plain elements and are not passed context.');

    if (arguments.length === 0 || typeof value === 'string' && arguments.length === 1) {
      return value && context ? context[value] : context;
    }

    this._renderer.render(this[0], _extends({}, context, value));
    (0, _utils.attachElementsToCollection)(this, getShallowTreeWithRoot(this._renderer));

    return this;
  },
  trigger: function trigger(event) {
    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
      args[_key2 - 1] = arguments[_key2];
    }

    if (event.indexOf('on') !== 0) event = 'on' + event[0].toUpperCase() + event.substr(1);

    return this.each(function (component) {
      var _component$props;

      component.props[event] && (_component$props = component.props)[event].apply(_component$props, args);
    });
  }
});

exports.default = $;
module.exports = exports['default'];