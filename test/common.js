import React from 'react';
import { unmountComponentAtNode, render } from 'react-dom';
import $ from '../src/element';

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

  it('should allow the first node to retrieved', ()=>{
    let instance = $(<Stateless name='hi'/>).shallowRender()

    instance.node().type.should.equal('div')
  })
})
