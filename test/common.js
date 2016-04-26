import React from 'react';
import ReactTestUtils from 'react-addons-test-utils';
import { unmountComponentAtNode } from 'react-dom';
import $ from '../src';
import ElementCollection from '../src/element';
import InstanceCollection from '../src/instance';
import commonPrototype from '../src/common';

describe('common', ()=> {
  let Stateless = () => <strong>foo</strong>

  let list = (
    <ul className='foo'>
      <li>item 1</li>
      <li className='foo'>item 2</li>
      <li className='foo'>item 3</li>
    </ul>
  )

  let Example = React.createClass({
    contextTypes: {
      question: React.PropTypes.string
    },

    getInitialState(){ return { greeting: 'hello there: ' } },
    render() {
      return (
        <div>
          {this.state.greeting + (this.props.name || 'person') + (this.context.question || '')}
          <Stateless>
            <strong>foo</strong>
          </Stateless>
          {list}
        </div>
      )
    }
  })

  afterEach(() => {
    $.defaultContext(null);
  })

  it('should create collection', ()=>{
    $(<div/>).length.should.equal(1)
    $(<div/>)[0].type.should.equal('div')
  })

  it('collection types should have the same common prototype', ()=>{
    Object.getPrototypeOf(ElementCollection.prototype)
      .should.equal(Object.getPrototypeOf(InstanceCollection.prototype))
      .and.equal($.prototype)
      .and.equal(commonPrototype)
  })

  it('$ should have a reference to ElementCollection', ()=>{
    $.element.should.equal(ElementCollection)
  })

  it('$ should have a reference to InstanceCollection', ()=>{
    $.instance.should.equal(InstanceCollection)
  })

  it('should allow extending both collections by assigning to .fn', ()=>{
    $.fn.type = function(){
      return this.nodes[0].element.type
    }

    $(<div />).type()
      .should.equal('div')

    $(ReactTestUtils.renderIntoDocument(<Example />)).type()
      .should.equal(Example)

    delete $.fn.type
  })

  it('extending an single collection type should not effect the other.', ()=>{
    $.element.fn.type = function(){
      return this.nodes[0].element.type
    }

    $(<div />).type()
      .should.equal('div')

    expect($(ReactTestUtils.renderIntoDocument(<Example />)).type)
      .to.not.exist
  })

  it('should track query root object', ()=> {
    let inst = $(<Example />).shallowRender()

    inst
      .find('Stateless')
      .tap(child => child.root.should.equal(inst))
      .find('strong')
      .tap(child => child.root.should.equal(inst))
  })

  it('should track prevObject', ()=> {
    let inst = $(<Example />).shallowRender()
      , second;

    second = inst
      .find('Stateless')
      .tap(child =>
        child.prevObject.should.equal(inst)
      )

    second
      .find('strong')
      .tap(child =>
        child.prevObject.should.equal(second)
      )
  })

  it('should shallow render element', ()=> {
    let inst = $(<Example />).shallowRender()
    inst[0].type.should.equal(Example)
  })

  it('should render element', ()=> {
    let instance = $(<div className='test'/>).render()

    instance._mountPoint.querySelectorAll('.test').length.should.equal(1)
    expect(instance._mountPoint.parentNode).to.not.exist
  })

  it('should render element using provided mount element', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(mount)

    mount.children[0].classList.contains('test').should.equal(true)
    instance._mountPoint.should.equal(mount)
    document.contains(mount).should.equal(false)
  })

  it('should render into document', ()=> {
    let instance = $(<div className='test'/>).render(true)

    document.querySelectorAll('.test').length.should.equal(1)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should render into document using provided mount element', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(true, mount)

    document.querySelectorAll('.test').length.should.equal(1)
    instance._mountPoint.should.equal(mount)

    document.contains(mount).should.equal(true)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should recreate the correct query type', ()=> {
    let instance = $(<div className='test'/>).render()
    let instanceB = $(instance);

    instance.should.not.equal(instanceB)
    expect(instance.root).to.equal(instanceB.root)
    expect(instance[0]).to.equal(instanceB[0])
  })


  describe(null, ()=> {

    let types = {
      shallow: (elements, context) => $(elements).shallowRender(null, context),
      DOM: (elements, context) => $(elements).render(context)
    }

    Object.keys(types).forEach(type => {
      let render = types[type];

      describe(type + ' rendering', function(){

        it('should maintain root elements after render', ()=>{
          render(<Example />).is(Example)
        })

        it('should work with Stateless components as root', ()=>{
          let inst = render(<Stateless />)
          inst[0].should.exist
          inst.is(Stateless).should.equal(true)
        })

        it('.end()', () => {
          render(<Example />)
            .find(Stateless)
              .find('strong')
                .tap(inst => inst.is('strong'))
              .end()
            .tap(inst => inst.is(Stateless))
            .end()
          .tap(inst => inst.is(Example))
        })

        it('.get()', ()=> {
          Array.isArray(render(<div/>).get()).should.equal(true)
        })

        it('.each()', ()=> {
          let inst = render(<Example />).find('li')
            , count = 0;

          inst.each((node, idx) => {
            expect(inst[idx]).to.equal(node)
            count++
          })

          expect(count).to.equal(3);
          expect(count).to.equal(inst.length);
        })

        it('registerPseudo() should allow pseudo extensions', ()=> {
          let stub = sinon.stub(console, 'error');

          $.registerPseudo('foo', false, (node, value) => {
            value.should.equal('4')
            return $(node).is('.foo')
          })

          $.registerPseudo('bar', (node, value) => {
            value.should.be.a('function')
            return $(node).is('.foo')
          })

          render(<Example />).find(':foo(4)').length.should.equal(3)
          render(<Example />).find(':bar(.baz)').length.should.equal(3)

          stub.should.have.been.calledTwice
          console.error.restore() //eslint-disable-line
        })

        it('createPseudo() should allow pseudo extensions', ()=> {
          $.createPseudo('foo', () => (node) => {
            return $(node).is('.foo')
          })

          render(<Example />).find(':foo').length.should.equal(3)
        })

        it('.tap()', ()=> {
          let spy = sinon.spy(function (n) { expect(n).to.exist.and.equal(this) });

          render(<Example />)
            .tap(spy)
            .find('li')
            .tap(spy)

          spy.should.have.been.calledTwice

          render(<Example />)
           .tap(node => node.length.should.equal(1))
           .find('li')
           .tap(node => node.length.should.equal(3))
        })

        it('props() should get props', ()=> {
          // -- unrendered elements ---
          $(<Example name='rikki-tikki-tavi'/>)
            .props('name').should.equal('rikki-tikki-tavi')
          $(<Example name='rikki-tikki-tavi'/>)
            .props().name.should.equal('rikki-tikki-tavi')

          // -- rendered versions ---
          render(<Example name='rikki-tikki-tavi'/>)
            .props('name').should.equal('rikki-tikki-tavi')

          render(<Example name='rikki-tikki-tavi'/>)
              .props().name.should.equal('rikki-tikki-tavi')
        })

        it('props() should change props', ()=> {

          render(<Example name='rikki-tikki-tavi'/>)
            .tap(inst => {
              inst.first('div > :text').unwrap()
                .should.equal('hello there: rikki-tikki-tavi')
            })
            .props('name', 'Nagaina')
            .tap(inst =>
              inst.first('div > :text').unwrap()
                .should.equal('hello there: Nagaina'))
            .props({ name: 'Nag' })
            .tap(inst =>
              inst.first('div > :text').unwrap()
                .should.equal('hello there: Nag'))

        })

        it('props() should throw on empty collecitons', ()=> {
          (() => render(<Example />).find('article').props({ name: 'Steven' }))
            .should.throw('the method `props()` found no matching elements')

          ;(() => render(<Example />).find('article').props())
            .should.throw('the method `props()` found no matching elements')
        })

        it('state() should get component state', ()=>{
          let inst = render(<Example/>)

          inst.state().should.eql({ greeting: 'hello there: ' });
          inst.state('greeting').should.equal('hello there: ')
        })

        it('state() should change component state', done => {

          render(<Example name='John'/>)
            .tap(inst => {
              inst.first('div > :text').unwrap()
                .should.equal('hello there: John')
            })
            .state('greeting', 'yo yo! ')
            .tap(inst =>
              inst.first('div > :text').unwrap()
                .should.equal('yo yo! John'))
            .state({ greeting: 'huzzah good sir: ' }, inst => {
              inst.first('div > :text').unwrap()
                .should.equal('huzzah good sir: John')
              done()
            })
        })

        it('state() should throw on empty collections', ()=> {
          (() => render(<Example />).find('article').state({ name: 'Steven' }))
            .should.throw('the method `state()` found no matching elements')

          ;(() => render(<Example />).find('article').state())
            .should.throw('the method `state()` found no matching elements')
        })

        it('context() should get context', ()=> {
          let context = { question: ', who dis?'};

          render(<Example />, context)
            .context('question').should.equal(context.question)

          render(<Example />, context)
            .context().should.eql(context)
        })

        it('context() should change context', ()=> {

          render(<Example />, { question: ', who dis?'})
            .tap(inst => {
              inst.first('div > :text').unwrap()
                .should.equal('hello there: person, who dis?')
            })
            .context('question', ', how are you?')
            .tap(inst =>
              inst.first('div > :text').unwrap()
                .should.equal('hello there: person, how are you?'))
            .context({ question: ', whats the haps?' })
            .tap(inst =>
              inst.first('div > :text').unwrap()
                .should.equal('hello there: person, whats the haps?'))

        })

        it('context() should throw on empty collections', ()=> {
          (() => render(<Example />).find('article').context({ name: 'Steven' }))
            .should.throw('the method `context()` found no matching elements')

          ;(() => render(<Example />).find('article').context())
            .should.throw('the method `context()` found no matching elements')
        })

        it('should use default context', ()=> {
          let context = { question: ', who dis?'};

          $.defaultContext(context);

          render(<Example />)
            .context('question').should.equal(context.question)

          render(<Example />)
            .context().should.eql(context)
        })

        it('should not reuse nodes on rerenders', ()=> {
          let Component = (props) => (
            <div>
              { props.toggle && <span>hello</span> }
              <p>foo</p>
            </div>
          )

          expect(()=> {
            render(<Component toggle/>)
              .render()
              .tap(s => {
                s.is(Component)
                s.find('span').length.should.equal(1)
                s.find('p').length.should.equal(1)
              })
              .props({ toggle: false })
              .tap(s => {
                s.is(Component)
                s.find('span').length.should.equal(0)
                s.find('p').length.should.equal(1)
              })
          })
          .to.not.throw()

        })

        it('.find() by tag or classname', ()=> {
          render(<Example />).find('li').length.should.equal(3)
          render(<Example />).find('.foo').length.should.equal(3)
        })

        it('.find() by Component Type', ()=> {
          render(<Example />).find(Stateless).length.should.equal(1)
        })

        it('.find() by :composite', ()=>{
          render(<Example />).find(':composite').length.should.equal(1);
        })

        it('.find() by :dom', ()=>{
          render(<Example />).find('div :dom').length.should.equal(5);
        })

        it('.find() should allow chaining ', (done)=> {
          render(<Example />)
            .find('ul.foo, Stateless')
            .tap(inst => {
              expect(inst.length).to.equal(2)
              inst.filter('ul').length.should.equal(1)
              inst.filter(Stateless).length.should.equal(1)
            })
            .find('li')
            .tap(inst => {
              expect(inst.length).to.equal(3)
              inst.get().every(node => $(node).is('li'))
              done()
            })
        })

        it('.filter()', ()=>{
          render(<Example />)
            .find('li')
            .tap(inst => inst.length.should.equal(3))
            .filter('.foo').length.should.equal(2)

          render(<Example />)
            .find('*')
            .filter(Stateless)
            .length.should.equal(1)
        })

        it('.filter() without a selector should be a noop', ()=>{
          let instance = render(<Example />)
          instance.filter().should.equal(instance)
        })

        it('.children()', ()=> {
          render(<Example />)
            .find('ul')
            .children().length.should.equal(3)
        })

        it('.children() should not include text nodes', ()=> {
          render(<Example />)
            .find('div')
            .children()
            .tap(n => n.is(':not(:text)').should.equal(true))
            .length.should.equal(2)
        })

        it('.parent()', ()=> {
          render(<Example />)
            .find('li')
            .parent()
            .tap(inst =>
              inst.elements()[0].type.should.equal('ul')
            )
            .length.should.equal(1)
        })

        it('.parents()', ()=> {
          render(<Example />)
            .find('li')
            .parents()
            .tap(inst =>
              inst.elements().map(e => e.type).should.eql(['ul', 'div', Example])
            )
            .length.should.equal(3)
        })

        it('.parents() with a selector', ()=> {
          render(<Example />)
            .find('li')
            .parents(':dom')
            .tap(inst =>
              inst.elements().map(e => e.type).should.eql(['ul', 'div'])
            )
            .length.should.equal(2)
        })

        it('.closest()', ()=> {
          render(<Example />)
            .find('li')
            .closest('div')
            .tap(inst =>
              inst.elements()[0].type.should.equal('div')
            )
            .length.should.equal(1)
        })

        it('.text()', ()=>{
          render(<Example />)
            .find(Stateless)
            .text().should.equal('foo')

          render(<Example />)
            .find('ul > li')
            .text().should.equal('item 1item 2item 3')
        })

        it(':contains', ()=>{
          render(<Example />)
            .find(':contains(foo)')
            .length.should.equal(3)
        })

        it(':textContent', ()=>{
          render(<Example />)
            .find('strong:textContent')
            .length.should.equal(1)

          render(<Example />)
            .find(':textContent(foo)')
            .length.should.equal(1)
        })

        it('.first()', ()=> {

          render(<Example />)
            .first('li')
            .text().should.equal('item 1')

          render(<Example />)
            .find('li')
            .first()
            .text().should.equal('item 1')
        })

        it('.first() should throw if there are no elements', ()=> {
          (() => render(<Example />).first('article'))
              .should.throw('the method `first()` found no matching elements')
        })

        it('.last()', ()=> {
          render(<Example />)
            .last('li')
            .text().should.equal('item 3')

          render(<Example />)
            .find('li')
            .last()
            .text().should.equal('item 3')
        })

        it('.last() should throw if there are no elements', ()=> {
          (() => render(<Example />).last('article'))
              .should.throw('the method `last()` found no matching elements')
        })

        it('.nth()', ()=> {
          render(<Example />)
            .nth(1, 'li')
            .text().should.equal('item 2')

          render(<Example />)
            .find('li')
            .nth(1)
            .text().should.equal('item 2')
        })

        it('.nth() should throw if there are no elements', ()=> {
          (() => render(<Example />).nth(0, 'article'))
              .should.throw('the method `nth()` found no matching elements')
        })

        it('.single()', ()=> {
          render(<Example />).single(Stateless).length.should.equal(1)
          render(<Example />).find(Stateless).single().length.should.equal(1)
        })

        it('.single() should throw more than one match is found', ()=> {
          (()=> render(<Example />)
            .single('li')).should.throw()
        })

        it('.single() should throw when nothing found', ()=> {
          (()=> render(<Example />)
            .single('article')).should.throw(/found: 0.+not 1/)
        })

        it('.any()', ()=> {
          render(<Example />).any(Stateless).length.should.equal(1)
          render(<Example />).find('ul > li').any().length.should.equal(3)
        })

        it('.any() should throw if no match is found', ()=> {
          (()=> render(<Example />)
            .any('article')).should.throw(/found 0.+expected to find 1 or more/)
        })

        it('.none()', ()=> {
          render(<Example />).none('article').length.should.equal(0)
          render(<Example />).find('article').none().length.should.equal(0)
        })

        it('.none() should throw if a match is found', ()=> {
          (()=> render(<Example />)
            .none('li')).should.throw(/found 3.+expected to find zero/)
        })

        it('.unwrap()', ()=> {
          let node = render(<Stateless name='hi'/>).unwrap()

          $.isQueryCollection(node).should.equal(false)
          $(node).is('strong')
        })

        it('.unwrap() should throw without exactly one node', ()=> {
          (()=> render(list).children().unwrap()).should.throw()

          ;(()=> render(<div />).children().unwrap()).should.throw()
        })

        it('.elements()', ()=> {
          let elements = render(<Example />).find('li').elements()

          elements.length.should.equal(3)
          elements.every(element => React.isValidElement(element))
        })
      })
    })
  })

})
