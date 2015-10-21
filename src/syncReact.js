import synchronizedComponent from './synchronizedComponent';

export default function syncReact(React) {
	return {
		Component: React.Component,
		createClass: React.createClass.bind(React),
		createElement: function(type, props, children) {
			if((typeof(type) == 'function') && type.prototype.render) {
				type = synchronizedComponent(type);
			}

			return React.createElement(type, props, children);
		},
		cloneElement: React.cloneElement.bind(React),
		createFactory: React.createFactory.bind(React),
		isValidElement: React.isValidElement.bind(React),
		DOM: React.DOM,
		PropTypes: React.PropTypes,
		Children: React.Children
	}
}
