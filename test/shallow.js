import React, { cloneElement } from 'react';
import $ from '../src/element';


describe('Shallow rendering', ()=> {
  let Stateless = props => <div onClick={props.onClick}>{props.children}</div>
  let List = class extends React.Component {
    render(){
      return (
        <div onClick={this.props.onClick}>
          <Stateless onClick={this.props.onClick}>
            <span className='stateless-inner' onClick={this.props.onClick}/>
          </Stateless>
          <ul onClick={this.props.onClick}>
            <li className='item' onClick={this.props.onClick}>hi 1</li>
            <li onClick={this.props.onClick}>hi 2</li>
            <li>hi 3</li>
          </ul>
        </div>
      )
    }
  }
  let counterRef
  let Counter = class extends React.Component {
    constructor(){
      super()
      this.state = {count:0}
      counterRef = this;
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

  it('create element collection', ()=>{
    let instance = $(<div/>)

    instance.context.type.should.equal('div')
    instance.length.should.equal(1)
  })

  it('should not try to render primitives', ()=>{
    let el = <div/>
      , instance = $(el)

    instance.context.should.equal(el)
  })

  it('should render Composite Components', ()=>{
    let el = <div/>
      , Element = ()=> el
      , instance = $(<Element/>).shallowRender()

    instance.context.should.equal(el)
  })

  it('should query Composite Components', ()=>{
    $(<Element></Element>)
      .is(Element).should.equal(true)

    $(<Element><div><span/></div></Element>)
      .find('div > span')
      .length.should.equal(1)
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
  })

  it('should get props', ()=>{
    let counter = $(<Counter/>)

    counter.shallowRender().prop('className').should.equal(0)
  })

  it('should get state', ()=>{
    let counter = $(<Counter/>)

    counter.shallowRender().state().should.eql({
      count: 0
    });

    counter.shallowRender().state('count').should.equal(0)
  })

  it('should maintain state between renders', ()=>{
    let counter = $(<Counter/>)

    counter.shallowRender().context.props.className.should.equal(0)
    counterRef.increment()
    counter.shallowRender().context.props.className.should.equal(1)
  })

  it('should update', ()=>{
    let counter = $(<Counter/>).shallowRender()

    counter.prop('className').should.equal(0)
    counterRef.increment()
    counter.update()
    counter.prop('className').should.equal(1)
  })

  it('should throw when updating none root elements', ()=> {
    let counter = $(<List/>).shallowRender()

    ;(() => counter.find('ul').update())
      .should.throw('You can only preform this action on a "root" element.')
  })

  it('should update root collections', ()=> {
    let count = 0;
    let Component = React.createClass({
      componentDidUpdate(){
        count++
      },
      render() {
        return (
          <div>
            <span onClick={() => this.setState({ called: true })} />
          </div>
        )
      }
    })

    let root = $(<Component />).shallowRender();

    root.find('span').trigger('click')
    count.should.equal(1)
    root.state().should.eql({ called: true })
  })

  describe('querying', ()=> {
    let FancyList = props => <ul className='fancy-list'>{props.children}</ul>
    let List = ()=> (
      <div>
        <FancyList>
          <li className='foo'>hi 1</li>
          <li className='foo'>hi 2</li>
          <li>hi 3</li>
        </FancyList>
      </div>
    )

    it('should: find()', ()=>{
      $(<List/>).shallowRender().find('li').length.should.equal(3)
    })

    it('should: children()', ()=> {
      $(<List/>).shallowRender().find(FancyList).children().length.should.equal(3)

      $(<List/>).shallowRender().find(FancyList).children('.foo').length.should.equal(2)
    })

    it('should: filter()', ()=>{
      let items = $(<List/>).shallowRender().find('li')

      items.length.should.equal(3)
      items.filter('.foo').length.should.equal(2)
    })

    it('an empty filter should be a noop', ()=>{
      let instance = $(<List/>).shallowRender()
      instance.filter().should.equal(instance)
    })

    it('text content', ()=>{
      $(<List/>).shallowRender().text().should.equal('hi 1hi 2hi 3')

      $(<div>hi <span>{'john'}</span></div>).text().should.equal('hi john')
    })

    it('should: is()', ()=>{
      $(<List/>).shallowRender().find('.foo')
        .is('li').should.equal(true)

      $(<List/>).shallowRender().find('.foo')
        .is($.s`${FancyList} > li`).should.equal(true)

      $(<List/>).shallowRender().find(FancyList)
        .is('div').should.equal(false)
    })
  })
})
