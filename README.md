teaspoon
========

A jQuery like API for querying React elements and rendered components.

## API

Like jQuery the exported function creates a collection of nodes, except in this case you select React elements instead
of DOM nodes.

```js
import $ from 'teaspoon';

let $div = $(<div/>);

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

### Using selectors

The supported selector syntax is subset of standard css selectors. You can query by tag: `'div > li'` or
by `className` with `'.my-class'`. Attribute selectors work on props: `'[show=true]'` or `'[name="my-input"]'`.
You can even use the `has()` pseudo selector for selecting parents. You can also use two React
specific pseudo selectors: `':dom'` and `':composite'` to select DOM and Composite Components respectively.

Unlike normal css selectors though, React Elements often have prop values, and element types that are not serializable
to a string. What if you needed to select a `MyList` component by its "tag" or wanted to get all elements with
a `date` prop equal to today?

With Component names you can use function or `displayName` of the component if you trust them.

```js
$(<Component>).render().find('div > List.foo')
```

Alternatively, and more robustly, you use a [tagged template string](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/template_strings#Tagged_template_strings).
via the `$.selector` (also aliased as `$.s`) function for writing complex selectors like so:

```
//select all `<MyList/>`s that are children of divs
$.s`div > ${List}`

//select components with `start` props equal to `min`
let min = 10
$.s`[start=${min}]`
```

If you don't want to use the newer syntax you can also call the `selector` function directly like:

```js
$.s('div > ', List, '.foo') // equivalent to: $.s`div > ${List}.foo`
```

### Common Collection methods

The methods are shared by both Element and Instance Collections.

#### `$.selector` -> selector _(alias: $.s)_

Selector creation function.

#### `$.fn.find(selector)`

Search all descendants of the current collection, matching against
the provided selector.

```js
$(<ul><li>item 1</li></ul>).find('ul > li')
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

$list.find('li').only('li') // Error! Matched more than one <li/>

$list.find('li').only('.foo').length // 1
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
$(<div>Hello <strong>John</strong></div).text() // "Hello John"
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
also have all the above "common" methods

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


### InstanceCollection

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
