import React, { cloneElement } from 'react';
import $ from '../src/shallow';
import { selector as sel } from 'bill';

chai.use(require('sinon-chai'))

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

  it('create rtq object', ()=>{
    let instance = $(<div/>)

    instance.root.type.should.equal('div')
    instance.length.should.equal(1)
  })

  it('should not try to render primitives', ()=>{
    let el = <div/>
      , instance = $(el)

    instance.root.should.equal(el)
  })

  it('should render Composite Components', ()=>{
    let el = <div/>
      , Element = ()=> el
      , instance = $(<Element/>)

    instance.root.should.equal(el)
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
      $(<List/>).find('li').length.should.equal(3)
    })

    it('should: children()', ()=> {
      $(<List/>).find(FancyList).children().length.should.equal(3)

      $(<List/>).find(FancyList).children('.foo').length.should.equal(2)
    })

    it('should: filter()', ()=>{
      let items = $(<List/>).find('li')

      items.length.should.equal(3)
      items.filter('.foo').length.should.equal(2)
    })

    it('an empty filter should be a noop', ()=>{
      let instance = $(<List/>)
      instance.filter().should.equal(instance)
    })

    it('should: is()', ()=>{
      $(<List/>).find('.foo')
        .is('li').should.equal(true)

      $(<List/>).find('.foo')
        .is(sel`${FancyList} > li`).should.equal(true)

      $(<List/>).find(FancyList)
        .is('div').should.equal(false)
    })
  })
})
