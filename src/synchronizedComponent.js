import deepEqual from 'deep-equal';

export default function synchronizedComponent(Component) {
	let instances = [];

	return class SynchronizedComponent extends Component {
		constructor() {
			super();

			if(instances.length > 0) {
				let primaryComponent = instances[0];
				this.state = primaryComponent.state;
			}

			instances.push(this);
		}

		componentDidUpdate(oldProps, oldState) {
			if(Component.prototype.componentDidUpdate) {
				super();
			}

			for(let component of instances) {
				if((component != this) && !deepEqual(this.state, component.state)) {
					component.setState(this.state);
				}
			}
		}
	}
}
