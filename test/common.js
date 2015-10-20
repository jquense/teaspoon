import { unmountComponentAtNode, render } from 'react-dom';
import $ from '../src/element';
import _React from 'react';
const React = $.syncReact(_React);
import Counter from './Counter';

describe('common utils', ()=> {
  let Stateless = props => <div onClick={props.onClick}>{props.children}</div>

  class List extends React.Component {
    render(){
      return (
        <div>
          <Stateless>
            <span className='stateless-inner' onClick={this.props.onClick}/>
          </Stateless>
        </div>
      )
    }
  }

  it('should create collection', ()=>{
    $(<div/>).length.should.equal(1)
    $(<div/>)[0].type.should.equal('div')
  })

  it('should get', ()=>{
    Array.isArray($(<div/>).get()).should.equal(true)
  })

  it('should render element', ()=> {
    let instance = $(<div className='test'/>).render()

    instance._mountPoint.querySelectorAll('.test').length.should.equal(1)
    expect(instance._mountPoint.parentNode).to.not.exist
  })

  it('should render element at mountPoint', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(false, mount)

    mount.children[0].classList.contains('test').should.equal(true)
    instance._mountPoint.should.equal(mount)
  })

  it('should render into document', ()=> {
    let instance = $(<div className='test'/>).render(true)

    document.querySelectorAll('.test').length.should.equal(1)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should render mount into document', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(true, mount)

    document.querySelectorAll('.test').length.should.equal(1)
    instance._mountPoint.should.equal(mount)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should work with Stateless components as root', ()=>{
    let instance = $(<Stateless name='hi'/>).render()
    instance.length.should.equal(1)
  })

  it('should shallow render', ()=>{
    let instance = $(<Stateless name='hi'/>).shallowRender()

    instance.length.should.equal(1)
    instance[0].type.should.equal('div')
  })

  describe('state synchronization between the shallow and deep rendered components', ()=>{
    it('should stay sychronized when the state is initially changed in the shallow rendered component', ()=>{
      let counter = $(<Counter/>)
      counter.shallowRender()
      let counterRef = Counter.ref

      counter.shallowRender().context.props.className.should.equal(0)
      counter.render().dom().textContent.should.equal('0')
      counterRef.increment()
      counter.shallowRender().context.props.className.should.equal(1)
      counter.render().dom().textContent.should.equal('1')
    })

    it('should stay sychronized when the state is initially changed in the deep rendered component', ()=>{
      let counter = $(<Counter/>)
      counter.render()
      let counterRef = Counter.ref

      counter.shallowRender().context.props.className.should.equal(0)
      counter.render().dom().textContent.should.equal('0')
      counterRef.increment()
      counter.shallowRender().context.props.className.should.equal(1)
      counter.render().dom().textContent.should.equal('1')
    })

    it('should immediately synchronize the state of the shallow rendered component if state is already available', function() {
      let counter = $(<Counter/>)

      counter.render()
      Counter.ref.increment()
      counter.shallowRender().context.props.className.should.equal(1)
    })

    it('should immediately synchronize the state of the deep rendered component if state is already available', function() {
      let counter = $(<Counter/>)

      counter.shallowRender()
      Counter.ref.increment()
      counter.render().dom().textContent.should.equal('1')
    })
  })
})
