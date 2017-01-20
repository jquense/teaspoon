
teaspoon
========

Just the right amount of abstraction for writing clear, and concise React component tests.

<!-- START doctoc generated TOC please keep comment here to allow auto update -->
<!-- DON'T EDIT THIS SECTION, INSTEAD RE-RUN doctoc TO UPDATE -->
**Table of Contents**  *generated with [DocToc](https://github.com/thlorenz/doctoc)*

- [Getting Started](#getting-started)
  - [Usage](#usage)
  - [Using selectors](#using-selectors)
  - [Complex selectors](#complex-selectors)
- [Testing patterns](#testing-patterns)
  - [Using `tap()`](#using-tap)
  - [Test specific querying ("ref" style querying).](#test-specific-querying-ref-style-querying)
- [Adding collection methods and pseudo selectors](#adding-collection-methods-and-pseudo-selectors)
  - [createPseudo(pseudo: string, handler: (innerValue: string) => (node: Node) => bool)](#createpseudopseudo-string-handler-innervalue-string--node-node--bool)
  - [Build warnings with webpack](#build-warnings-with-webpack)
- [API](#api)
  - [Rendering](#rendering)
      - [`$.fn.render([Bool renderIntoDocument, HTMLElement mountPoint, Object context ])`](#fnrenderbool-renderintodocument-htmlelement-mountpoint-object-context-)
      - [`$.fn.shallowRender([props, context]) -> ElementCollection`](#fnshallowrenderprops-context---elementcollection)
      - [`$.element.fn.update()`](#elementfnupdate)
      - [`$.instance.fn.unmount()`](#instancefnunmount)
  - [Utility methods and properties](#utility-methods-and-properties)
      - [`$.selector` => selector _(alias: $.s)_](#selector--selector-_alias-s_)
      - [`$.dom(instance) => HTMLElement`](#dominstance--htmlelement)
      - [`$.compileSelector(selector) => (node) => bool`](#compileselectorselector--node--bool)
      - [`$.defaultContext(context: ?object) => (node) => bool`](#defaultcontextcontext-object--node--bool)
      - [`$.fn.length`](#fnlength)
      - [`$.fn.unwrap() => Element|Instance|HTMLElement`](#fnunwrap--elementinstancehtmlelement)
      - [`$.fn.get() => Array` (alias: toArray())](#fnget--array-alias-toarray)
      - [`$.fn.tap() => function(Collection)`](#fntap--functioncollection)
      - [`$.fn.end() => Collection`](#fnend--collection)
      - [`$.fn.each(Function iteratorFn)`](#fneachfunction-iteratorfn)
      - [`$.fn.map(Function iteratorFn)`](#fnmapfunction-iteratorfn)
      - [`$.fn.reduce(Function iteratorFn, [initialValue]) -> Collection`](#fnreducefunction-iteratorfn-initialvalue---collection)
      - [`$.fn.reduceRight(Function iteratorFn) -> Collection`](#fnreducerightfunction-iteratorfn---collection)
      - [`$.fn.some(Function iteratorFn) -> bool`](#fnsomefunction-iteratorfn---bool)
      - [`$.fn.every(Function iteratorFn) -> bool`](#fneveryfunction-iteratorfn---bool)
      - [`$.instance.fn.dom -> HTMLElement`](#instancefndom---htmlelement)
  - [Accessors](#accessors)
      - [`$.fn.props`](#fnprops)
      - [`$.fn.state`](#fnstate)
      - [`$.fn.context`](#fncontext)
  - [Traversal methods](#traversal-methods)
      - [`$.fn.find(selector)`](#fnfindselector)
      - [`$.fn.filter(selector)`](#fnfilterselector)
      - [`$.fn.is(selector) -> Bool`](#fnisselector---bool)
      - [`$.fn.children([selector])`](#fnchildrenselector)
      - [`$.fn.parent([selector])`](#fnparentselector)
      - [`$.fn.parents([selector])`](#fnparentsselector)
      - [`$.fn.closest([selector])`](#fnclosestselector)
      - [`$.fn.first([selector])`](#fnfirstselector)
      - [`$.fn.last([selector])`](#fnlastselector)
      - [`$.fn.only()`](#fnonly)
      - [`$.fn.single(selector)`](#fnsingleselector)
      - [`$.fn.any([selector])`](#fnanyselector)
      - [`$.fn.none([selector])`](#fnnoneselector)
      - [`$.fn.text()`](#fntext)
  - [Events](#events)
      - [`$.instance.fn.trigger(String eventName, [Object data])`](#instancefntriggerstring-eventname-object-data)
      - [`$.element.fn.trigger(String eventName, [Object data])`](#elementfntriggerstring-eventname-object-data)

<!-- END doctoc generated TOC please keep comment here to allow auto update -->

## Getting Started

To get started install teaspoon via npm:

```sh
npm i --save-dev teaspoon
```

Teaspoon is test environment agnostic, so you can (and should) bring your own test runner and frameworks.
If you plan on doing normal component rendering (not just shallow rendering) you will also need a DOM environment,
whether that's a browser, headless browser, or jsdom.

Like jQuery teaspoon exports a function that creates a collection of nodes; except in this case
you select React elements instead of DOM nodes.


### Usage

```js
import $ from 'teaspoon';

let $div = $(<div />);

$div.length // 1
$div[0]     // ReactElement{ type: 'div', props: {} ... }
```

Since there is no globally accessible "document" of React elements like there is of DOM nodes, you need
to start by selecting a tree. Once you have a tree you can query it with css selectors and jQuery-like methods.

```js
let elements = (
  <MyComponent>
    <MyInput/>
    <MyInput/>
    <div className='fun-div'>  
  </MyComponent>
);

let $elements = $(elements);

$elements.find('div.fun-div').length // 1
$elements.find(MyInput).length // 2
```

Along with plain ol' ReactElements you can also use teaspoon to traverse a rendered component tree.
Teaspoon also does a bunch of work under the hood to normalize the traversal behavior of DOM components,
Custom Components, and Stateless function Components.

```js
let Greeting = props => <div>hello <strong>{props.name}</strong></div>;

let instance = ReactDOM.render(<Greeting name='John' />, mountNode)

let $instance = $(instance);

$instance.find('strong').text() // "John"
```

That's nice but a bit verbose, luckily teaspoon lets you switch between both collection types
(element and instance) nice and succinctly.

```js
let Greeting = props => <div>hello <strong>{props.name}</strong></div>;

// renders `<Greeting/>` into the DOM and returns an collection of instances
let $elements = $(<Greeting />).render();

$elements.find('strong').text() // "John"

$elements.unmount() // removes the mounted component and returns a collection of elements

//or with shallow rendering
$elements.shallowRender()
  .find('strong').text() // "John"
```

### Using selectors

The supported selector syntax is subset of standard css selectors:

- classes: `.foo`
- attributes: `div[propName="hi"]` or `div[boolProp]`
- `>`: direct descendant `div > .foo`
- `+`: adjacent sibling selector
- `~`: general sibling selector
- `:has()`: parent selector `div:has(a.foo)`
- `:not()`: negation
- `:first-child`
- `:last-child`
- `:text` matches "text" (renderable) nodes, which may be a non string value (like a number)
- `:dom` matches only DOM components
- `:composite` matches composite (user defined) components
- `:contains(some text)` matches nodes that have a text node descendant containing the provided text
- `:textContent(some text)` matches whose text content matches the provided text

Selector support is derived from the underlying selector engine: [bill](https://github.com/jquense/bill). New minor
versions of bill are released independent of teaspoon, so you can always check there to see what is supported on the
cutting edge.

### Complex selectors

Unlike normal css selectors, React elements and components often have prop values, and component types that are
not serializable to a string; components are often best selected by their actual class and not a name, and
prop values can complex objects such as a `date` prop equaling `new Date()`.

For components, we've already seen that you can use the function name or the `displayName`, but
sometimes they aren't available. A less brittle approach is to select by the function _itself_. You can
use a [tagged template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings).
via the `$.selector` (also aliased as `$.s`) function for writing complex selectors like so:

```js
$.s`div > ${Greeting}`

// select components with `start` props _strictly_ equal to `min`
let min = 10
$.s`[start=${min}]`
```

If you don't want to use the newer syntax you can also call the `selector` function directly like:

```js
$.s('div > ', Greeting, '.foo') // equivalent to: $.s`div > ${Greeting}.foo`
```

Use can use these complex selectors in any place a selector is allowed:

```js
let Name = props => <strong>{props.name}</strong>;
let Time = props => <em>{props.date.toLocaleString()}</em>
let Greeting = props => <div>hello <Name {...props} /> its: <Time {...props} /></div>;

let now = new Date();
let $inst = $(<Greeting name='John' date={now} />);

$inst
  .render()
  .find($.s`${Greeting} > strong`)
  .text()

$inst
  .shallowRender()
  .find($.s`${Time}[date=${now}]`)
  .only()  
```

## Testing patterns

As far as testing libraries go `teaspoon` has fairly few opinions about how to do stuff, so you can adapt whatever
testing practices and patterns you like. However there are some patterns and paths that fall out naturally from
teaspoon's API.

### Using `tap()`

[`tap()`](#fntap---functioncollection) provides a way to quickly step in the middle of a chain of queries and
collections to make a quick assertion. Below we quickly make a few changes to the component props and
check that the rendered output is what we'd expect.

```js
let Greeting = props => <div>hello <strong>{props.name}</strong></div>;

$(<Greeting name='rikki-tikki-tavi'/>)
  .render()
  .tap(collection => {
    collection
      .first('div > :text')
      .unwrap()
      .should.equal('hello rikki-tikki-tavi')
  })
  .props('name', 'Nagaina')
  .tap(collection => {
    collection
      .first('div > :text')
      .unwrap()
      .should.equal('hello Nagaina')
  })
  .unmount()
```

### Test specific querying ("ref" style querying).

An age old struggle with testing HTML output is that tests are usually not very resilient to
DOM structure changes. You may move a save button into (or out of) some div that your test used to find the button,
breaking the test. A classic technique to avoid this is the just use css classes, however it can be hard to
distinguish between styling classes, and testing hooks.

In a React environment we can do one better, adding test specific attribute. This is a pattern taken up by libraries like
[react-test-tree](https://github.com/QubitProducts/react-test-tree), and while `teaspoon` doesn't specifically "support"
that style of selection, its selector engine is more than powerful enough to allow that pattern of querying.

You can choose any prop name you like, but we recommend picking one that isn't likely to collide with a
component's "real" props. In this example let's use `_testID`.

```js
let Greeting = props => <div>hello <strong _testID='name'>{props.name}</strong></div>;

$(<Greeting name='Betty' />)
  .render()
  .find('[_testID=name]')
  .text()
  .should.equal('Betty')
```

You can adapt and expand this pattern however your team likes, maybe just using the single testing prop or a few.
You can also add some helper methods or pseudo selectors to help codify enforce your teams testing conventions.

## Adding collection methods and pseudo selectors

Teaspoon also allows extending itself and adding new pseudo selectors using a fairly straight forward API.

To add a new method for all collection types add it to `$.fn`
(or `$.prototype` if the jQuery convention bothers you).

```js
// Returns all DOM node descendants and filters by a selector
$.fn.domNodes = function(selector) {
  return this
    .find(':dom')
    .filter(selector)
}

// also works with shallowRender()
$(<MyComponent />).render().domNodes('.foo')
```

If you want to make a method only available to either instance of element collections you can extend
`$.instance.fn` or `$.element.fn` following the same pattern as above.

### createPseudo(pseudo: string, handler: (innerValue: string) => (node: Node) => bool)

For new pseudo selectors you can use the `createPseudo` API which provides
a hook into the css selector engine used by teaspoon: [bill](https://github.com/jquense/bill). Pseudo selectors _do_
introduce a new object not extensively covered here, the `Node`. A Node is a light abstraction that
encapsulates both component instances and React elements, in order to provide a common traversal API across tree types.
You can read about them and their properties [here](https://github.com/jquense/bill#node).

```js
// input:name(email)
$.createPseudo('name', function (name) {
  // return a function that matches against elements or instances
  return function (node) {
    return $(node).is(`[name=${name}]`)
  }
})

// We want to test if an element has a sibling that matches
// a selector e.g. :nextSibling(.foo)
$.createPseudo('nextSibling', function (selector) {
  // turning the selector into a matching function up front
  // is a bit more performant, alternatively we could just do $(node).is(selector);
  let matcher = $.compileSelector(selector)

  return function (node) {
    let sibling = node.nextSibling;
    return sibling != null && matcher(sibling)
  }
})
```


### Build warnings with webpack

Teaspoon has a few conditional `require`s in order to support versions of React across major versions. This tends to
mean webpack warns about missing files, even when they aren't actually bugs. You can ignore the warnings or add an extra
bit of config to silence them.

```js
/* webpack.config.js */
// ...
externals: {
  // use for react 15.4.+
  'react/lib/ReactMount': true,

  // use for React any version below that
  'react-dom/lib/ReactMount': true,
}
// ...
```

## API

Teaspoon does what it can to abstract away the differences between element and instance collections into a
common API, however everything doesn't coalesce nicely, so some methods are only relevant and available for
collections of instances and some for collections of elements.

Methods that are common to both collections are listed as: `$.fn.methodName`

Whereas methods that are specific to a collection type are
listed as: `$.instance.fn.methodName` and `$.element.fn.methodName` respectively

### Rendering

##### `$.fn.render([Bool renderIntoDocument, HTMLElement mountPoint, Object context ])`

Renders the first element of the Collection into the DOM using `ReactDom.render`. By default
the component won't be added to the page `document`, you can pass `true` as the first parameter to render into the
document.body. Additionally you can provide your own DOM node to mount the component into and/or a `context` object.

`render()` returns a new _InstanceCollection_

```js
let elements = (
  <MyComponent>
    <div className='fun-div'>  
  </MyComponent>
);

let $elements = $(elements).render();

// accessible by document.querySelectorAll
$elements = $(elements).render(true);

// mount the component to the <span/>
$elements = $(elements).render(document.createElement('span'));
```

##### `$.fn.shallowRender([props, context]) -> ElementCollection`

Use the React shallow renderer utilities to _shallowly_ render the first element of the collection.

```js
let MyComponent ()=> <div>Hi there!</div>

$(<MyComponent/>)
  .find('div')
  .length // 0

$(<MyComponent/>)
  .shallowRender()
  .find('div')
  .length // 1
```

##### `$.element.fn.update()`

Since shallow collections are not "live" in the same way a real rendered component tree is, you may
need to manually update the root collection to flush changes (such as those triggered by a child component).

In general you may not have to ever use `update()` since teaspoon tries to take care of all that for
you by spying on the `componentDidUpdate` life-cycle hook of root component instance.

##### `$.instance.fn.unmount()`

Unmount the current tree and remove it from the DOM. `unmount()` returns an
ElementCollection of the _root_ component element.

```js
let $inst = $(<Greeting name='John' date={now} />);
let rendered = $inst.render();

//do some stuff...then:
rendered.unmount()
```

### Utility methods and properties

The methods are shared by both Element and Instance Collections.

##### `$.selector` => selector _(alias: $.s)_

Selector creation function.

##### `$.dom(instance) => HTMLElement`

Returns the DOM nodes for a component instance, if it exists.

##### `$.compileSelector(selector) => (node) => bool`

Compiles a selector into a function that matches a node

##### `$.defaultContext(context: ?object) => (node) => bool`

You can globally set a context object to be used for each and all renders,
shallow or otherwise. This is helpful for context that is available to all
levels of the application, like the `router`, i18n context, or a Redux Store.

##### `$.fn.length`

The length of the collection.

##### `$.fn.unwrap() => Element|Instance|HTMLElement`

Unwraps a collection of a single item returning the item. Equivalent to `$el[0]`; throws when there
is more than one item in the collection.

```js
$(<div><strong>hi!</strong></div>)
  .find('strong')
  .unwrap() // -> <strong>hi!</strong>
```

##### `$.fn.get() => Array` (alias: toArray())

Returns a real JavaScript array of the collection items.

##### `$.fn.tap() => function(Collection)`

Run an arbitrary function against the collection, helpful for making assertions while chaining.

```js
$(<MyComponent/>).render()
  .prop({ name: 'John '})
  .tap(collection =>
    expect(collection.children().length).to.equal(2))
  .find('.foo')
```

##### `$.fn.end() => Collection`

Exits a chain, by returning the previous collection

```js
$(<MyComponent/>).render()
  .find('ul')
    .single()
  .end()
  .find('div')
```

##### `$.fn.each(Function iteratorFn)`

An analog to `Array.prototype.forEach`; iterates over the collection calling the `iteratorFn`
with each item, index, and collection.

```js
$(<MyComponent/>).render()
  .find('div')
  .each((node, index, collection)=>{
    //do something
  })
```

##### `$.fn.map(Function iteratorFn)`

An analog to `Array.prototype..map`; maps over the collection calling the `iteratorFn`
with each item, index, and collection.

```js
$(<MyComponent/>).render()
  .find('div')
  .map((node, index, collection) => {
    //do something
  })
```

##### `$.fn.reduce(Function iteratorFn, [initialValue]) -> Collection`

An analog to `Array.prototype..reduce`, returns a new _reduced_ teaspoon Collection

```js
$(<MyComponent/>).render()
  .find('div')
  .reduce((current, node, index, collection)=>{
    return current + ', ' + node.textContent
  }, '')
```

##### `$.fn.reduceRight(Function iteratorFn) -> Collection`

An analog to `Array.prototype.reduceRight`.

##### `$.fn.some(Function iteratorFn) -> bool`

An analog to `Array.prototype.some`.

##### `$.fn.every(Function iteratorFn) -> bool`

An analog to `Array.prototype.every`.

##### `$.instance.fn.dom -> HTMLElement`

Returns the DOM nodes for each item in the Collection, if the exist

### Accessors

##### `$.fn.props`

Set or get props from a component or element.

Setting props can only be done on __root__ collections given the
reactive nature of data flow in react trees (or on any element of a tree that isn't rendered).

- `.props()`: retrieve all props
- `.props(propName)`: retrieve a single prop
- `.props(propName, propValue, [callback])`: update a single prop value
- `.props(newProps, [callback])`: merge `newProps` into the current set of props.

##### `$.fn.state`

Set or get state from a component or element. In shallowly rendered trees only the __root__ component
can be stateful.

- `.state()`: retrieve state
- `.state(stateName)`: retrieve a single state value
- `.state(stateName, stateValue, [callback])`: update a single state value
- `.state(newState, [callback])`: merge `newState` into the current state.

##### `$.fn.context`

Set or get state from a component or element. In shallowly rendered trees only the __root__ component
can have context.

- `.context()`: retrieve context
- `.context(String contextName)`: retrieve a single context value
- `.context(String contextName, Any contextValue, [Function callback])`: update a single context value
- `.context(Object newContext, [Function callback])`: replace current context.

### Traversal methods

##### `$.fn.find(selector)`

Search all descendants of the current collection, matching against
the provided selector.

```js
$(
<div>
  <ul>
    <li>item 1</li>
  </ul>
</div>
).find('ul > li')
```

##### `$.fn.filter(selector)`

Filter the current collection matching against the provided
selector.

```js
let $list = $([
  <li>1</li>,
  <li className='foo'>2</li>,
  <li>3</li>,
]);

$list.filter('.foo').length // 1
```

##### `$.fn.is(selector) -> Bool`

Test if each item in the collection matches the provided
selector.

##### `$.fn.children([selector])`

Return the children of the current selection, optionally filtered by those matching a provided selector.

__note:__ rendered "Composite" components will only ever have one child since Components can only return a single node.

```js
let $list = $(
  <ul>
    <li>1</li>
    <li className='foo'>2</li>
    <li>3</li>
  </ul>
);

$list.children().length // 3

$list.children('.foo').length // 1
```

##### `$.fn.parent([selector])`

Get the parent of each node in the current collection, optionally filtered by a selector.

##### `$.fn.parents([selector])`

Get the ancestors of each node in the current collection, optionally filtered by a selector.

##### `$.fn.closest([selector])`

For each node in the set, get the first element that matches the selector by testing the element
and traversing up through its ancestors.

##### `$.fn.first([selector])`

return the first item in a collection, alternatively search all
collection descendants matching the provided selector and return
the first match.

##### `$.fn.last([selector])`

return the last item in a collection, alternatively search all
collection descendants matching the provided selector and return
the last match.

##### `$.fn.only()`

Assert that the current collection as only one item.

```js
let $list = $(
  <ul>
    <li>1</li>
    <li className='foo'>2</li>
    <li>3</li>
  </ul>
);

$list.find('li').only() // Error! Matched more than one <li/>

$list.find('li.foo').only().length // 1
```

##### `$.fn.single(selector)`

Find assert that only item matches the provided selector.

```js
let $list = $(
  <ul>
    <li>1</li>
    <li className='foo'>2</li>
    <li>3</li>
  </ul>
);

$list.single('li') // Error! Matched more than one <li/>

$list.single('.foo').length // 1
```


##### `$.fn.any([selector])`

Assert that the collection contains one or more nodes.
Optionally search by a provided selector.

```js
let $list = $(
  <ul>
    <li>1</li>
    <li className='foo'>2</li>
    <li>3</li>
  </ul>
);

$list.any('p')  // Error!

$list.any('li').length // 3
```

##### `$.fn.none([selector])`

Assert that the collection contains no nodes. Optionally search by a provided selector.

```js
let $list = $(
  <ul>
    <li>1</li>
    <li className='foo'>2</li>
    <li>3</li>
  </ul>
);

$list.none('li')  // Error!

$list.none('p').length // 0
```

##### `$.fn.text()`

Return the text content of the matched Collection.

```js
let $els = $(<div>Hello <strong>John</strong></div)

$els.text() // "Hello John"
```


### Events

Utilities for triggering and testing events on rendered and shallowly rendered components.

##### `$.instance.fn.trigger(String eventName, [Object data])`

Trigger a "synthetic" React event on the collection items. works just like `ReactTestUtils.simulate`

```js
  $(<Component/>).render()
    .trigger('click', { target: { value: 'hello ' } }).
```

##### `$.element.fn.trigger(String eventName, [Object data])`

Simulates (poorly) event triggering for shallow collections. The method looks for a prop
following the convention 'on[EventName]': `trigger('click')` calls `props.onClick()`, and re-renders the root collection

Events don't bubble and don't have a proper event object.

```js
  $(<Component/>).shallowRender()
    .find('button')
    .trigger('click', { target: { value: 'hello ' } }).
```
