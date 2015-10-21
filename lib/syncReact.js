'use strict';

exports.__esModule = true;
exports['default'] = syncReact;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _synchronizedComponent = require('./synchronizedComponent');

var _synchronizedComponent2 = _interopRequireDefault(_synchronizedComponent);

function syncReact(React) {
	return {
		Component: React.Component,
		createClass: React.createClass.bind(React),
		createElement: function createElement(type, props, children) {
			if (typeof type == 'function' && type.prototype.render) {
				type = _synchronizedComponent2['default'](type);
			}

			return React.createElement(type, props, children);
		},
		cloneElement: React.cloneElement.bind(React),
		createFactory: React.createFactory.bind(React),
		isValidElement: React.isValidElement.bind(React),
		DOM: React.DOM,
		PropTypes: React.PropTypes,
		Children: React.Children
	};
}

module.exports = exports['default'];