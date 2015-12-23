import React, { cloneElement } from 'react';
import $ from '../src/element';


describe.only('shallow rendering', ()=> {
  let counterRef, StatefulExample, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
    StatefulExample = React.createClass({
      componentDidUpdate: updateSpy,
      componentWillMount(){ counterRef = this },
      getInitialState(){ return { count: 0} },
      increment() {
        let { count = 0 } = this.state
        this.setState({ count: count + 1 })
      },
      render() {
        return (
          <div>
            <span onClick={this.increment} />
          </div>
        )
      }
    })
  })


  it('should not try to render primitives', ()=>{
    let el = <div/>

    $(el).shallowRender().context[0].should.equal(el)
  })

  it('should render Composite Components', ()=>{
    let el = <div/>
      , Element = ()=> el;

    $(<Element/>).shallowRender().unwrap().should.equal(el)
  })

  it('should filter out invalid Elements', ()=>{
    let instance = $(
        <ul>
          { false }
          { null}
          {'text'}
          <li>hi 1</li>
          <li>hi 2</li>
          <li>hi 3</li>
        </ul>
      )

    instance.children().length.should.equal(3)
    instance.shallowRender().length.should.equal(3)
  })

  it('should maintain state between renders', ()=>{
    let counter = $(<StatefulExample/>)

    counter.shallowRender().state('count').should.equal(0)
    counterRef.increment()
    counter.shallowRender().state('count').should.equal(1)
  })

  it('should update', ()=> {
    let counter = $(<StatefulExample/>).shallowRender()

    counter.state('count').should.equal(0)
    counterRef.increment()
    updateSpy.should.have.been.calledOnce
    counter.state('count').should.equal(1)
  })

  it('should throw when updating none root elements', ()=> {
    let counter = $(<StatefulExample/>).shallowRender()

    ;(() => counter.find('span').update())
      .should.throw('You can only preform this action on a "root" element.')
  })

  it('should update root collections', ()=> {
    let inst = $(<StatefulExample />).shallowRender();

    inst
      .find('span')
      .trigger('click')
      .context
        .state('count').should.equal(1)

    updateSpy.should.have.been.calledOnce
  })
})
