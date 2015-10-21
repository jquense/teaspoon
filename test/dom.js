import React from 'react';
import { unmountComponentAtNode, render } from 'react-dom';
import $ from '../src/element';
import * as utils from '../src/utils';
import Counter from './Counter';

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
    //expect($inst.context).to.equal(utils.getInternalInstance(instance))
    expect($inst._mountPoint).to.equal(mount)
  })

  it('should recreate $ object', ()=> {
    let instance = $(<div className='test'/>)
    let instanceB = $(instance);

    instance.should.not.equal(instanceB)
    expect(instance.context).to.equal(instanceB.context)
    expect(instance[0]).to.equal(instanceB[0])
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

  it('should maintain state between renders', ()=>{
    let counter = $(<Counter/>)

    counter.render().dom().textContent.should.equal('0')
    Counter.ref.increment()
    counter.render().dom().textContent.should.equal('1')
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
  describe('querying', ()=> {

    describe('find', ()=> {
      it('should find by Component Types', ()=>{
        let instance = $(<Component className='test'/>).render()

        instance.find(List)[0].should.be.an.instanceof(List);
      })

      it('should find by Component Stateless Types', ()=>{
        let instance = $(<Component className='test'/>).render()

        instance.find(Stateless).length.should.equal(1);
      })

      it('should find by :composite', ()=>{
        let instance = $(<Component className='test'/>).render()

        let result = instance.find(':composite')
        result.length.should.equal(3);
      })

      it('should find by :dom', ()=>{
        let instance = $(<Component className='test'/>).render()

        let result = instance.find(':dom')
        result.length.should.equal(10);
      })

      it('should return stateless component DOM nodes', ()=>{
        let instance = $(<Component className='test'/>).render()

        instance.find(Stateless)[0].should.be.an.instanceof(HTMLElement);
      })

      it('should find by className', ()=>{
        let instance = $(<Component className='test'/>).render()

        instance.find('.list-wrapper')[0].tagName.should.equal('DIV');
      })

      it('should find by tag', ()=>{
        let instance = $(<Component className='test'/>).render()

        instance.find('li').length.should.equal(3);
      })

      it('should allow find chaining', ()=>{
        let instance = $(<Component className='test'/>).render()

        let items = instance
          .find('.list-wrapper')
          .find(List)
          .find('li')

        items.length.should.equal(3);
        items[0].should.be.an.instanceof(HTMLElement)

        items = instance
          .find(List)
          .find(Stateless)
          .find('span')

        items.length.should.equal(1);
        items[0].should.be.an.instanceof(HTMLElement)
        items[0].tagName.should.equal('SPAN')
      })
    })

    describe('is', ()=> {
      it('should recognize Component Types', ()=>{
        let instance = $(<Component className='test'/>).render()

        instance.is(Component).should.equal(true);
      })

      it('should recognize Stateless Types', ()=>{
        let instance = $(<Stateless/>).render()

        instance.is(Stateless).should.equal(true);
      })

      it('should recognize className', ()=>{
        let instance = $(<span className='test'/>).render()

        instance.is('.test').should.equal(true);
      })

      it('should recognize tags', ()=>{
        let instance = $(<span/>).render()

        instance.is('span').should.equal(true);
      })

      it('should recognize :composite', ()=>{
        let instance = $(<List/>).render()

        instance.is(':composite').should.equal(true);
      })

      it('should recognize :dom', ()=>{
        let instance = $(<span/>).render()

        instance.is(':dom').should.equal(true);
      })

      it('should work with find', ()=>{
        let instance = $(<Component/>).render()

        instance.find(Stateless).is(Stateless).should.equal(true);
      })

      it('should work with multiple matches', ()=>{
        let instance = $(<Component/>).render()

        instance.find('li').is('li').should.equal(true);
      })

      it('should work with chaining', ()=>{
        let instance = $(<Component/>).render()

        instance.find('li').is('.item').should.equal(false);

        instance.find('li').first().is('.item').should.equal(true);
      })
    })

    it('should: filter()', ()=>{
      let items = $(<Component/>).render().find('li')

      items.length.should.equal(3)

      items.filter('.item').length.should.equal(1)

      $(<Component/>).render().find('div > *').filter(List).length.should.equal(1)
    })

    it('an empty filter should be a noop', ()=>{
      let instance = $(<Component/>).render()
      instance.filter().should.equal(instance)
    })

    it('should get first', ()=> {
      let instance = $(<Component className='test'/>).render()

      instance.first('li')[0].textContent.should.equal('hi 1')

      instance.find('li').first()[0].textContent.should.equal('hi 1')
    })

    it('should get last', ()=> {
      let instance = $(<Component className='test'/>).render()

      instance.last('li')[0].textContent.should.equal('hi 3');
      instance.find('li').last()[0].textContent.should.equal('hi 3')
    })

    it('should find single', ()=> {
      let instance = $(<Component className='test'/>).render()

      instance.single(Stateless).length.should.equal(1)
    })

    it('should throw when single returns more than one', ()=> {
      let instance = $(<Component className='test'/>).render()

      ;(()=> instance.single('li')).should.throw()
    })

    it('should throw when single returns none', ()=> {
      let instance = $(<Component className='test'/>).render()

      ;(()=> instance.single('article')).should.throw()
    })

    it('should get children', ()=> {
      $(<Component />).render()
        .find('ul')
        .children().length.should.equal(3)
    })

    it('text content', ()=>{
      $(<List/>).render().text().should.equal('Hello therehi 1hi 2hi 3')

      $(<div>hi <span>{'john'}</span></div>).render().text().should.equal('hi john')
    })

    it('should trigger event', ()=> {
      let clickSpy = sinon.spy();
      let instance = $(<Component className='test' onClick={clickSpy}/>).render()

      instance.find(List).trigger('click', { clickedYo: true })

      clickSpy.should.have.been.calledOnce
    })
   })
})
