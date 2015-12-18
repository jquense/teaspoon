teaspoon
========

A jQuery like API for querying React elements and rendered components.


- [Getting started](#getting-started)
- [api](#api)
  - [Common Collection methods](#common-collection-methods)  
  - [Element Collections](#elementcollection-api)  
  - [Component Instance Collections](#instancecollection-api)  

## Getting Started

To get started install teaspoon via npm:

```sh
npm i --save-dev teaspoon
```

Teaspoon is test enviroment agnostic, so you can (and should) bring your own test runner and frameworks. If you plan on doing normal component rendering (not just shallow rendering) you will also need a DOM environment, whether thats a browser, headless browser, or jsdom.

Like jQuery teaspoon exports a function that creates a collection of nodes; except in this case you select React elements instead
of DOM nodes.

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

var $elements = $(elements);

$elements.find('div.fun-div').length // 1
$elements.find(MyInput).length // 2
```

Along with plain ol' ReactElements you can also use teaspoon to traverse a rendered component tree. Teaspoon also does a bunch of work under the hood to normalize the traversal behavior of DOM components, Custom Components, and Stateless function Components.

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

// renders `<Greeting/>` into the DOM and returns an InstanceCollection
var $elements = $(<Greating />).render(); /

$elements.find('strong').text() // "John"

$elements.unmount() // removes the mounted component and returns an ElementCollection

//or with shallow rendering
$elements.shallowRender()
  .find('strong').text() // "John"
```

### Using selectors

The supported selector syntax is subset of standard css selectors. 

- You can query by tag or component name: `'div > Greeting'`
- by `className` with `'.my-class'`. 
- Attribute selectors work on props: `'[show=true]'` or `'[name="my-input"]'`.
- You can even use the `has()` pseudo selector for selecting parents: `ul > li.foo:has(span > p.bar)`
- You can also use two React specific pseudo selectors: `':dom'` and `':composite'` to select DOM and Composite Components respectively.

Unlike normal css selectors though, React Elements often have prop values, and element types that are not serializable
to a string; components names are often best seelcted by their actual class and not a name, and prop values are often not strings such as `date` equaling `new Date()`.

For components we've already seen that you can use the constructor function name or the `displayName` but sometimes they aren't available. Alternatively, and more robustly, you use a [tagged template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings).
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

## API

### Common Collection methods

The methods are shared by both Element and Instance Collections.

#### `$.selector` -> selector _(alias: $.s)_

Selector creation function.

#### `$.fn.find(selector)`

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

#### `$.fn.filter(selector)`

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

### `$.fn.children([selector])`

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

#### `$.fn.is(selector) -> Bool`

Test if each item in the collection matches the provided
selector.

#### `$.fn.first([selector])`

return the first item in a collection, alternatively search all
collection descendants matching the provided selector and return
the first match.

#### `$.fn.last([selector])`

return the last item in a collection, alternatively search all
collection descendants matching the provided selector and return
the last match.

#### `$.fn.only()`

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

#### `$.fn.single(selector)`

Find and assert that only item matches the provided selector.

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

#### `$.fn.unwrap()`

Unwraps a collection of a single item returning the item. Equivalent to `$el[0]`; throws when there
is more than one item in the collection.

#### `$.fn.text()`

Return the text content of the matched Collection.

```js
let $els = $(<div>Hello <strong>John</strong></div)

$els.text() // "Hello John"
```

#### `$.fn.get() -> Array`

Returns a real JavaScript array of the collection items.

#### `$.fn.each(Function iteratorFn)`

An analog to `[].forEach`; iterates over the collection calling the `iteratorFn` with each item, idx, and collection

```js
$(<MyComponent/>).render()
  .find('div')
  .each((node, index, collection)=>{
    //do something
  })
```

#### `$.fn.map(Function iteratorFn)`

An analog to `[].map`; maps over the collection calling the `iteratorFn` with each item, idx, and collection

```js
$(<MyComponent/>).render()
  .find('div')
  .map((node, index, collection) => {
    //do something
  })
```

#### `$.fn.reduce(Function iteratorFn, [initialValue])`

An analog to `[].reduce`, returns a new _reduced_ teaspoon Collection

```js
$(<MyComponent/>).render()
  .find('div')
  .reduce((current, node, index, collection)=>{
    return current + ', ' + node.textContent
  }, '')
```



### ElementCollection API

ElementCollections are created when selecting ReactElements. They
also have all the above "common" methods. ShallowRendering creates and operates on ElementCollections as well.

#### `$(ReactElement element) -> ElementCollection`

Create an ElementCollection from an Element or array of Elements.

#### `$.fn.render([Bool renderIntoDocument, HTMLElement mountPoint ]) -> InstanceCollection`

Renders the first element of the ElementCollection into the DOM using `ReactDom.render`. By default
the component won't be added to the page `document`, you can pass `true` as the first parameter to render into the
document.body. Additional you can provide your own DOM node to mount the component into.

`render()` returns a new _InstanceCollection_

```js
let elements = (
  <MyComponent>
    <div className='fun-div'>  
  </MyComponent>
);

var $elements = $(elements).render();

$elements = $(elements).render(true); //accessible by document.querySelectorAll

$elements = $(elements).render(true, document.createElement('span')); //mounts the component to the <span/>
```

#### `$.fn.shallowRender([props]) -> ElementCollection`

Use the React shallow renderer utilities to _shallowly_ render the first element of the collection.

```js
let MyComponent ()=> <div>Hi there!</div>

$(<MyComponent/>).find('div').length // 0

$(<MyComponent/>).shallowRender().is('div') // true
```



### InstanceCollection API

InstanceCollections are created when selecting Component instances, such as
the result of a `ReactDOM.render()` call.

The public "instances" for components differ. DOM component instances
are the DOM nodes themselves, and Stateless Components technically don't have any
(we use the DOM node though). One key advantage to over the normal React
test utils is that here you can continue to chain `find` and `filter` on
DOM and Stateless components.

#### `$.fn.dom -> HTMLElement`

Returns the DOM nodes for each item in the Collection, if the exist

#### `$.fn.unmount -> HTMLElement`

Unmount the current tree and remove it from the DOM. `unmount()` returns an
ElementCollection of the _root_ component element.

#### `$.fn.trigger(String eventName, [Object data])`

Trigger a "synthetic" (React) event on the collection items.

```js
$(<Component/>).render().trigger('click', { target: { value: 'hello ' } }).
```
