import React from 'react';
import $ from '../src/element';

describe('shallow rendering specific', ()=> {
  let counterRef, StatefulExample, updateSpy;

  beforeEach(() => {
    updateSpy = sinon.spy();
    StatefulExample = class extends React.Component {
      state = { count: 0}
      componentDidUpdate = updateSpy
      componentWillMount(){ counterRef = this }
      increment = () => {
        let { count = 0 } = this.state
        this.setState({ count: count + 1 })
      }
      render() {
        return (
          <div>
            {this.props.name || 'folk'}
            <span onClick={this.increment}>
              {this.state.count}
            </span>
          </div>
        )
      }
    }
  })


  it('should not try to render primitives', ()=>{
    let el = <div/>

    $(el).shallowRender().unwrap().should.equal(el)
  })

  it('should render Composite Components', ()=>{
    let el = <div/>
      , Example = ()=> el
      , element = <Example/>;

    let inst = $(element).shallowRender();
    inst.unwrap().should.not.equal(element)
    inst.unwrap().type.should.equal(Example)
  })

  it('should filter out invalid Elements', ()=>{
    let instance = $([
        false,
        null,
        'text',
        <li>hi 1</li>,
        <li>hi 2</li>,
        <li>hi 3</li>
      ])

    // breaking? 3 -> 4
    instance.length.should.equal(4)
  })


  it('prop() should throw when updating a non-root rendered collection', ()=> {
    (() => $(<StatefulExample />).shallowRender().find('span').props({ name: 'Steven' }))
      .should.throw(
        'changing the props on a shallow rendered child is an anti-pattern, ' +
        'since the elements props will be overridden by its parent in the next update() of the root element'
      )
  })

  it('should update when a root update occurs', ()=> {
    let counter = $(<StatefulExample/>).shallowRender()

    counter.state('count').should.equal(0)
    counter.find('span').text().should.equal('0')

    counterRef.increment()

    updateSpy.should.have.been.calledOnce
    counter.state('count').should.equal(1)
    counter.find('span').text().should.equal('1')
  })

  it('should throw when updating non-root elements', ()=> {
    let counter = $(<StatefulExample/>).shallowRender()

    ;(() => counter.find('span').update())
      .should.throw('You can only preform this action on a "root" element.')
  })

  it('should update root when props or state are changed', ()=> {
    let inst = $(<StatefulExample />).shallowRender();

    inst
      .props({ name: 'The boy' })
      .tap(inst =>
        inst.find('div > :first-child').unwrap().should.equal('The boy'))
      .state({ count: 40 })
      .find('span').text().should.equal('40')

    updateSpy.should.have.been.calledOnce
  })

  it('trigger() should update root collections', ()=> {
    let inst = $(<StatefulExample />).shallowRender();

    inst
      .find('span')
      .trigger('click')
      .root
        .tap(inst =>
          inst.find('span').text().should.equal('1'))
        .state('count').should.equal(
          inst.state('count')
        )

    updateSpy.should.have.been.calledOnce
  })



})
