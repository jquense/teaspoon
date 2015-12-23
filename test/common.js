import React from 'react';
import { unmountComponentAtNode, render } from 'react-dom';
import $ from '../src';

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
    // to test getters
    getInitialState(){ return { count: 1 } },
    render() {
      return (
        <main>
          <div>
            {'hello there: ' + (this.props.name || 'person')}
            <Stateless>
              <strong>foo</strong>
            </Stateless>
            {list}
          </div>
        </main>
      )
    }
  })

  it('should create collection', ()=>{
    $(<div/>).length.should.equal(1)
    $(<div/>)[0].type.should.equal('div')
  })

  it('should shallow render element', ()=> {
    let inst = $(<Example />).shallowRender()
    inst[0].type.should.equal('main')
  })

  it('should render element', ()=> {
    let instance = $(<div className='test'/>).render()

    instance._mountPoint.querySelectorAll('.test').length.should.equal(1)
    expect(instance._mountPoint.parentNode).to.not.exist
  })

  it('should render element using provided mount element', ()=> {
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

  it('should render into document using provided mount element', ()=> {
    let mount = document.createElement('div')
    let instance = $(<div className='test'/>).render(true, mount)

    document.querySelectorAll('.test').length.should.equal(1)
    instance._mountPoint.should.equal(mount)

    unmountComponentAtNode(instance._mountPoint)
  })

  it('should recreate the correct query type', ()=> {
    let instance = $(<div className='test'/>).render()
    let instanceB = $(instance);

    instance.should.not.equal(instanceB)
    expect(instance.context).to.equal(instanceB.context)
    expect(instance[0]).to.equal(instanceB[0])
  })

  describe(null, ()=> {

    let types = {
      shallow: (elements) => $(elements).shallowRender(),
      DOM: (elements) => $(elements).render(),
    }

    Object.keys(types).forEach(type => {
      let render = types[type]
        , isDomTest = type === 'DOM';


      describe(type + ' rendering', function(){

        it('should work with Stateless components as root', ()=>{
          let inst = render(<Stateless />)
          inst[0].should.exist
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

        it('.tap()', ()=> {
          let spy = sinon.spy(function (n) { expect(n).to.exist.and.equal(this) })
            , inst = render(<Example />);

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

        // it('should get props', ()=>{
        //   $(<Example name='rikki-tikki-tavi'/>)
        //     .prop('name').should.equal('rikki-tikki-tavi')
        //
        //   render(<Example name='rikki-tikki-tavi'/>)
        //     .prop('name').should.equal('rikki-tikki-tavi')
        // })
        //
        // it('should get state', ()=>{
        //   let inst = $(<Example/>)
        //
        //   inst.state().should.eql({ count: 1 });
        //   inst.shallowRender().state('count').should.equal(1)
        // })

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
          render(<Example />).find('main :dom').length.should.equal(6);
        })

        it('.find() should allow chaining ', (done)=> {
          render(<Example />)
            .find('ul.foo, Stateless')
            .tap(coll => {
              expect(coll.length).to.equal(2)
              coll.filter('ul').length.should.equal(1)
              coll.filter(Stateless).length.should.equal(1)
            })
            .find('li')
            .tap(coll => {
              expect(coll.length).to.equal(3)
              coll.get().every(node => $(node).is('li'))
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

        it('.text() content', ()=>{
          render(<Example />)
            .find(Stateless)
            .text().should.equal('foo')

          render(<Example />)
            .find('ul > li')
            .text().should.equal('item 1item 2item 3')
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
          ;(() => render(<Example />).first('article'))
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
          ;(() => render(<Example />).last('article'))
              .should.throw('the method `last()` found no matching elements')
        })

        it('.single()', ()=> {
          render(<Example />).single(Stateless).length.should.equal(1)
        })

        it('.single() should throw more than one match is found', ()=> {
          ;(()=> render(<Example />)
            .single('li')).should.throw()
        })

        it('.single() should throw when nothing found', ()=> {
          ;(()=> render(<Example />)
            .single('article')).should.throw()
        })

        it('.unwrap()', ()=> {
          let node = render(<Stateless name='hi'/>).unwrap()

          $.isQueryCollection(node).should.equal(false)
          $(node).is('strong')
        })

        it('.unwrap() should throw without exactly one node', ()=> {
          ;(()=> render(list).children().unwrap()).should.throw()

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
