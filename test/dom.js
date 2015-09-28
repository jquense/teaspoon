import React from 'react';
import { unmountComponentAtNode, render } from 'react-dom';
import $ from '../src/index';
import { match, selector as sel } from '../src/instance-selector';

chai.use(require('sinon-chai'))


describe('DOM rendering', ()=> {
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

  describe('css selector parsing', ()=>{

    it('should match nested', ()=>{
      let inst = $(<Component/>).get();

      match('.list-wrapper', inst).length.should.equal(1)

      match(sel`div.list-wrapper > ${List}`, inst).length.should.equal(1)

      match(sel`${Stateless}`, inst).length.should.equal(1)

      match(sel`.list-wrapper:has(${List})`, inst).length.should.equal(1)

      match(sel`span:has(${List})`, inst).length.should.equal(0)
    })

  })

  it('should wrap existing mounted component', ()=> {
    let instance = render(<div className='test'/>, document.createElement('div'))

    let $inst = $(instance);

    expect($inst[0]).to.equal(instance);
    expect($inst.context).to.equal(instance)
  })

  it('should recreate rtq object', ()=> {
    let instance = $(<div className='test'/>)
    let instanceB = $(instance);

    instance.should.not.equal(instanceB)
    expect(instance.context).to.equal(instanceB.context)
    expect(instance[0]).to.equal(instanceB[0])
  })

  it('should render element', ()=> {
    let instance = $(<div className='test'/>)

    instance.context.tagName.should.equal('DIV')
    expect(instance._mountPoint.parentNode).to.not.exist
  })

  it('should render element at mountPoint', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>, mount)

    mount.children[0].classList.contains('test').should.equal(true)
    instance._mountPoint.should.equal(mount)
  })

  it('should render into document', ()=> {
    let instance = $(<div className='test'/>, true)

    document.querySelectorAll('.test').length.should.equal(1)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should render mount into document', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>, mount, true)

    document.querySelectorAll('.test').length.should.equal(1)
    instance._mountPoint.should.equal(mount)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should work with Stateless components as root', ()=>{
    let instance = $(<Stateless name='hi'/>)

    instance.length.should.equal(1)
  })

  it('should unmount', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>, mount, true)

    document.querySelectorAll('.test').length.should.equal(1)

    instance.unmount()

    document.querySelectorAll('.test').length.should.equal(0)
    expect(instance.context).to.not.exist
    expect(mount.parentNode).to.not.exist
  })

  it('should return DOM node from Component', ()=> {
    let instance = $(<div className='test'/>)

    instance.dom().should.be.an.instanceof(HTMLElement)
  })

  it('should return DOM node from HTMLElement', ()=> {
    let div = document.createElement('div')
    $.dom(div).should.equal(div)
  })

  it('should `get()` underlying element', ()=> {
    let instance = $(<Component className='test'/>)

    instance.get().should.equal(instance[0])
  })

  it('should set props', ()=> {
    let instance = $(<Component className='test'/>)

    instance.setProps({ min: 5 })

    instance[0].props.min.should.equal(5)
  })

  describe('querying', ()=> {

    describe('find', ()=> {
      it('should find by Component Types', ()=>{
        let instance = $(<Component className='test'/>)

        instance.find(List).get().should.be.an.instanceof(List);
      })

      it('should find by Component Stateless Types', ()=>{
        let instance = $(<Component className='test'/>)

        instance.find(Stateless).length.should.equal(1);
      })

      it('should find by :composite', ()=>{
        let instance = $(<Component className='test'/>)

        let result = instance.find(':composite')
        result.length.should.equal(2);
      })

      it('should find by :dom', ()=>{
        let instance = $(<Component className='test'/>)

        let result = instance.find(':dom')
        result.length.should.equal(10);
      })

      it('should return stateless component dom nodes', ()=>{
        let instance = $(<Component className='test'/>)

        instance.find(Stateless).get().should.be.an.instanceof(HTMLElement);
      })

      it('should find by className', ()=>{
        let instance = $(<Component className='test'/>)

        instance.find('.list-wrapper').get().tagName.should.equal('DIV');
      })

      it('should find by tag', ()=>{
        let instance = $(<Component className='test'/>)

        instance.find('li').length.should.equal(3);
      })

      it('should allow find chaining', ()=>{
        let instance = $(<Component className='test'/>)

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
        let instance = $(<Component className='test'/>)

        instance.is(Component).should.equal(true);
      })

      it('should recognize Stateless Types', ()=>{
        let instance = $(<Stateless/>)

        instance.is(Stateless).should.equal(true);
      })

      it('should recognize className', ()=>{
        let instance = $(<span className='test'/>)

        instance.is('.test').should.equal(true);
      })

      it('should recognize tags', ()=>{
        let instance = $(<span/>)

        instance.is('span').should.equal(true);
      })

      it('should recognize :composite', ()=>{
        let instance = $(<List/>)

        instance.is(':composite').should.equal(true);
      })

      it('should recognize :dom', ()=>{
        let instance = $(<span/>)

        instance.is(':dom').should.equal(true);
      })

      it('should work with find', ()=>{
        let instance = $(<Component/>)

        instance.find(Stateless).is(Stateless).should.equal(true);
      })

      it('should work with multiple matches', ()=>{
        let instance = $(<Component/>)

        instance.find('li').is('li').should.equal(true);
      })

      it('should work with chaining', ()=>{
        let instance = $(<Component/>)

        instance.find('li').is('.item').should.equal(false);

        instance.find('li').first().is('.item').should.equal(true);
      })
    })

    it('should: filter()', ()=>{
      let items = $(<Component/>).find('li')

      items.length.should.equal(3)

      items.filter('.item').length.should.equal(1)

      $(<Component/>).find('div > *').filter(List).length.should.equal(1)
    })

    it('an empty filter should be a noop', ()=>{
      let instance = $(<Component/>)
      instance.filter().should.equal(instance)
    })

    it('should find single', ()=> {
      let instance = $(<Component className='test'/>)

      instance.single(Stateless).length.should.equal(1)
    })

    it('should throw when single returns more than one', ()=> {
      let instance = $(<Component className='test'/>)

      ;(()=> instance.single('li')).should.throw()
    })

    it('should throw when single returns none', ()=> {
      let instance = $(<Component className='test'/>)

      ;(()=> instance.single('article')).should.throw()
    })

    it('should get first', ()=> {
      let instance = $(<Component className='test'/>)

      instance.first('li')[0].textContent.should.equal('hi 1')

      instance.find('li').first()[0].textContent.should.equal('hi 1')
    })

    it('should get last', ()=> {
      let instance = $(<Component className='test'/>)

      instance.last('li')[0].textContent.should.equal('hi 3');
      instance.find('li').last()[0].textContent.should.equal('hi 3')
    })

    it('should trigger event', ()=> {
      let clickSpy = sinon.spy();
      let instance = $(<Component className='test' onClick={clickSpy}/>)

      instance.find(List).trigger('click', { clickedYo: true })

      clickSpy.should.have.been.calledOnce
    })
  })
})
