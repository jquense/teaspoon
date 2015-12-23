import React from 'react';
import { unmountComponentAtNode, render } from 'react-dom';
import $ from '../src';
import * as utils from '../src/utils';

describe('DOM rendering', ()=> {
  let Stateless = props => <div onClick={props.onClick}>{props.children}</div>
  let List = class extends React.Component {
    render(){
      return (
        <div onClick={this.props.onClick}>
          Hello there
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

  let Component = class extends React.Component {
    render(){
      return (
        <div>
          <span>hi</span>
          <div className='list-wrapper'>
            <List onClick={this.props.onClick}/>
          </div>
        </div>
      )
    }
  }

  it('should wrap existing mounted component', ()=> {
    let mount = document.createElement('div')
      , instance = render(<div className='test'/>, mount)

    let $inst = $(instance);

    expect($inst[0]).to.equal(instance);
    expect($inst._mountPoint).to.equal(mount)
  })

  it('should unmount', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(true, mount)

    document.querySelectorAll('.test').length.should.equal(1)

    let next = instance.unmount()

    document.querySelectorAll('.test').length.should.equal(0)
    expect(instance.context).to.not.exist
    expect(mount.parentNode).to.not.exist

    expect(next[0].type).to.equal('div')
  })

  it('should return DOM node from Component', ()=> {
    let instance = $(<div className='test'/>).render()

    instance.dom().should.be.an.instanceof(HTMLElement)
  })

  it('should return DOM node from HTMLElement', ()=> {
    let div = document.createElement('div')
    $.dom(div).should.equal(div)
  })

  it('should `get()` underlying element', ()=> {
    let instance = $(<Component className='test'/>)

    instance.get()[0].should.equal(instance[0])
  })
//
//   it('should set props', ()=> {
//     let instance = $(<Component className='test'/>)
//
//     instance.setProps({ min: 5 })
//
//     instance[0].props.min.should.equal(5)
//   })
//

  it('should trigger event', ()=> {
    let clickSpy = sinon.spy();
    let instance = $(<Component className='test' onClick={clickSpy}/>).render()

    instance.find(List).trigger('click', { clickedYo: true })

    clickSpy.should.have.been.calledOnce
  })
})
