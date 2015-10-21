import React, { cloneElement } from 'react';
import $ from '../src/element';
import Counter from './Counter';

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

  it('should maintain state between renders', ()=>{
    let counter = $(<Counter/>)

    counter.shallowRender().context.props.className.should.equal(0)
    Counter.ref.increment()
    counter.shallowRender().context.props.className.should.equal(1)
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
