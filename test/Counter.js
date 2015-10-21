import React from 'react';

const Counter = class extends React.Component {
	constructor(){
		super()
		this.state = {count:0}
		Counter.ref = this;
	}

	increment(){
		this.setState({count:this.state.count + 1});
	}

	render(){
		return (
			<span className={this.state.count}>{this.state.count}</span>
		)
	}
}

export default Counter;
