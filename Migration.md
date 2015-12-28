## `5.0.0` -> `6.0.0`

Not a lot has changed to the public API, but a large amount of internal refactoring did happen!
Most breaking changes are minor and may not affect your projects.

Most breaking changes are related to shallow rendering, and were made to improve the API and increase consistency.

#### `.context` changes

While never a public api `.context` may have been used to access the root element/instance of a collection.
in `6.0.0` context changed to `.root` and is now consistently a teaspoon collection, across collection types. It
is still __not considered a public api__ so tread carefully.

#### Shallow Rendering maintains the root element as the rendered collection

##### `5.0.0`

```js
let Greeting = ()=> <div>Hello there</div>

$(<Greeting />)
  .shallowRender()
  .is('div') // true
```

##### `6.0.0`

```js
let Greeting = ()=> <div>Hello there</div>

$(<Greeting />)
  .shallowRender()
  .is(Greeting) // true
```

To migrate change `$().shallowRender()` to `$().shallowRender().children()` in instances where your test was depending
on the above case.


### shallowRender() no longer re-renders the node if it was already rendered

##### `5.0.0`

```js
$(<StatefulComponent />).shallowRender()
//do something to change state
$(<StatefulComponent />).shallowRender()
//collection reflects the updated state/props
```

##### `6.0.0`

```js
let inst = $(<StatefulComponent />).shallowRender()
//do something to change state
inst.update() //collection reflects the updated state/props

$(<StatefulComponent />).shallowRender()
// renders a new instance of <StatefulComponent> using a new renderer
```

In most cases the additions of `trigger` and state, prop, and context accessor methods eliminate the need to manually
refresh the root collection. If you do need to though use the new `update()` method. And in most cases you will want
to save a reference to the _rendered_ collection instead of the plain element collection.
