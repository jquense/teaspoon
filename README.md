teaspoon
========

A jQuery like API for querying React elements and rendered components.

## API

Like jQuery the exported function creates a collection of nodes, except in this case you select ReactElements instead
of DOM nodes.

```js
import $ from 'teaspoon';

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

`teaspoon` actually supports _two_ types of collections, we've already seen Element Collections,
but you can also work with Component _instance_ collections as well for querying rendered components.

```js
let instance = ReactDOM.render(<Component/>, mountNode)

let $instance = $(instance);

$instance.dom() // HTMLElement
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

### using selectors

The selector syntax is subset of normal css selectors. You can query by tag: `'div > li'` or
by `className` with `'.my-class'`. Attribute selectors work on props: `'[show=true]'` or `'[name="my-input"]'`.
You can even use the `has()` pseudo selector for selecting parents.

Unlike normal css selectors though, React Elements often have prop values, and element types that are not serializable
to a string. What if you needed to select a `MyList` component by its "tag" or wanted to get all elements with
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
