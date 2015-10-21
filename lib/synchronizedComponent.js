'use strict';

exports.__esModule = true;
exports['default'] = synchronizedComponent;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError('Cannot call a class as a function'); } }

function _inherits(subClass, superClass) { if (typeof superClass !== 'function' && superClass !== null) { throw new TypeError('Super expression must either be null or a function, not ' + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var _deepEqual = require('deep-equal');

var _deepEqual2 = _interopRequireDefault(_deepEqual);

function synchronizedComponent(Component) {
	var instances = [];

	return (function (_Component) {
		_inherits(SynchronizedComponent, _Component);

		function SynchronizedComponent() {
			_classCallCheck(this, SynchronizedComponent);

			_Component.call(this);

			if (instances.length > 0) {
				var primaryComponent = instances[0];
				this.state = primaryComponent.state;
			}

			instances.push(this);
		}

		SynchronizedComponent.prototype.componentDidUpdate = function componentDidUpdate(oldProps, oldState) {
			if (Component.prototype.componentDidUpdate) {
				_Component.prototype.componentDidUpdate.call(this);
			}

			for (var _iterator = instances, _isArray = Array.isArray(_iterator), _i = 0, _iterator = _isArray ? _iterator : _iterator[Symbol.iterator]();;) {
				var _ref;

				if (_isArray) {
					if (_i >= _iterator.length) break;
					_ref = _iterator[_i++];
				} else {
					_i = _iterator.next();
					if (_i.done) break;
					_ref = _i.value;
				}

				var component = _ref;

				if (component != this && !_deepEqual2['default'](this.state, component.state)) {
					component.setState(this.state);
				}
			}
		};

		return SynchronizedComponent;
	})(Component);
}

module.exports = exports['default'];