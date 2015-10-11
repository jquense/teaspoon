React TestUtils utils
========

A simple jquery like api wrapper for the React TestUtils to make them a bit friendlier to use.

Updated for react 0.14; works seamlessly with Stateless Components and you can find and filter on DOM components
as well.

## API

Like jQuery the exported function creates a collection of nodes, except in this case you select ReactElements instead
of DOM nodes.

```js
import $ from 'react-testutil-query';

let $div = $(<div/>);

$div.length // 1
$div[0]     // ReactElement{ type: 'div', props: {} ... }
```

Since there is no globally accessible "document" of ReactElements like there is of DOM nodes, you need
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

`react-testutil-query` actually supports _two_ types of collections, we've already seen Element Collections,
but you can also work with Component _instance_ collections as well for querying rendered components.

```js
let instance = ReactDOM.render(<Component/>, mountNode)

let $instance = $(instance);

$instance.dom() // HTMLElemen
```

There is even a quick way to switch between them.

```js
let elements = (
  <MyComponent>
    <MyInput/>
    <MyInput/>
    <div className='fun-div'>  
  </MyComponent>
);

var $elements = $(elements).render(); // renders `<MyComponent/>` into the DOM and returns an InstanceCollection

$elements.find(MyInput).dom() // HTMLElement{ tagName: 'input' ... }

$elements.unmount() // removes the mounted component and returns an ElementCollection
```

### Common Collection methods

The methods are shared by both Element and Instance Collections.

#### $.selector -> selector

Selector creation function.

#### $.fn.find(selector)

Search all descendants of the current collection, matching against
the provided selector.

```js
$(<ul><li>item 1</li></ul>).find('ul > li')
```

#### $.fn.filter(selector)

Filter the current collection matching against the provided
selector.

#### $.fn.is(selector) -> Bool

Test if each item in the collection matches the provided
selector.

#### $.fn.first([selector])

return the first item in a collection, alternatively search all
collection descendants matching the provided selector and return
the first match.

#### $.fn.last([selector])

return the last item in a collection, alternatively search all
collection descendants matching the provided selector and return
the last match.

#### $.fn.only()

Assert that the current collection as only one item.

#### $.fn.single(selector)

Find and assert that only item matches the provided selector.

#### $.fn.text()

Return the text content of the matched Collection.

```js
$(<div>Hello <strong>John</strong></div).text() // "Hello John"
```

### ElementCollection API

ElementCollections are created when selecting ReactElements. They
also have all the above "common" methods

#### $(ReactElement element) -> ElementCollection

Create an ElementCollection from an Element or array of Elements.

#### $.fn.render([Bool renderIntoDocument, HTMLElement mountPoint ]) -> InstanceCollection

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

#### $.fn.shallowRender(props) -> ElementCollection

Use the React shallow renderer utilities to _shallowly_ render the first element of the collection.

```js
let MyComponent ()=> <div>Hi there!</div>

$(<MyComponent/>).find('div').length // 0

$(<MyComponent/>).shallowRender().is('div') // true
```

### $.fn.children([selector])

Return the children of the current selection, optionally filtered by those matching a provided selector.

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

### InstanceCollection

InstanceCollections are created when selecting Component instances, such as
the result of a `ReactDOM.render()` call.

The public "instances" for components differ. DOM component instances
are the DOM nodes themselves, and Stateless Components technically don't have any
(we use the DOM node though). One key advantage to over the normal React
test utils is that here you can continue to chain `find` and `filter` on
DOM and Stateless components.

#### $.fn.dom -> HTMLElement

Returns the DOM nodes for each item in the Collection, if the exist

#### $.fn.unmount -> HTMLElement

Unmount the current tree and remove it from the DOM. `unmount()` returns an
ElementCollection of the _root_ component element.


### using selectors

The selector syntax is subset of normal css selectors. You can query by tag: `'div > li'` or
by `className` with `'.my-class'`. Attribute selectors work on props: `'[show=true]'` or `'[name="my-input"]'`.
You can even use the `has()` pseudo selector for selecting parents.

Unlike normal css selectors though, React Elements often have prop values, and element types that are not serializable
to a nice string. What if you needed to select a `MyList` component by its "tag" or wanted to get all elements with
a `date` prop equal to today?

To write selectors for these values we use an es6 tagged template string! Both the DOM and shallow rendering
imports expose a `$.selector` (also aliased as `$.s`) for writing complex selectors like so:

```
//select all `<MyList/>`s that are children of divs
$.s`div > ${List}`

//select components with `start` props equal to `min`
let min = 10
$.s`[start=${10}]`
```

### Traditional DOM rendering

```js
var $r = require('react-testutil-query')

var elements = (
      <MyComponent>
          <MyInput/>
          <div className='fun-div'>
          <MyInput/>
      </MyComponent>
    )

var $root = $r(elements) // renders and returns a wrapped instance

$r($root)    // | calling it again won't rerender or rewrap
$r($root[0]) // |

//-- simple selector syntax --
$root.find('.fun-div') //class
$root.find('div')      // tag name

$root.find(MyInput)    // component type

// complex selectors
$root.find('div.foo > span:has(div.bar)')  
$root.find($.s`${MyList} > li.foo`)

$root.find(':dom')        // all dom nodes
$root.find(':composite')  // all non DOM components

$root.find()  // everything! all descendents

//-- like jquery you get an arraylike thing
$root.find(MyInput).length // 2

$root.find(MyInput).each( (component, idx) => /*do something */)

// use the index or `get()` to unwrap the collection into a single component or real array
$root.find('.fun-div')[0]


$root.find(MyInput).first()
$root.find(MyInput).last()

// you can still get the implicit asserts for finding single components
$root.find('.fun-div').only() // throws a TypeError .length === 0
$root.single('.fun-div')      // is the same thing


// -- getting DOM nodes
$root.single('.fun-div').dom() // returns the single DOM node
$root.find(MyInput).dom() //returns an array of DOM nodes

// -- events
$root.find(MyInput).trigger('change', { target: { value: 6 }}) // triggers onChange for all of them
```

### Shallow rendering

To query shallow rendered Components use the `'react-testutil-query/shallow'` import

```js
var $ = require('react-testutil-query/shallow');

let label = 'list item';

let BasicList = props => <ul>{props.children}</ul>

let DivList = ()=> (
  <div>
    <BasicList className='my-list'>
      <li className='foo'>hi 1</li>
      <li className='foo'>hi 2</li>
      <li aria-label={label}>hi 3</li>
    </BasicList>
  </div>
)


let $root = $(<DivList);

$root.find('.my-list > li.foo').length // 2

$root.find('.my-list').children('.foo').length // 2

$root.find('div li[aria-label="list item"]').length // 1

// selectors for your custom components
$root.find($.s`${BasicList} > li.foo`).length // 2

//or for prop values
$root.find($.s`li[aria-label=${label}]`).length // 1

$root.find(BasicList)
  .children()
  .filter(element => element.props.className === 'foo')
  .length // 2

$root.find(BasicList).is('.my-list').length // true

```
