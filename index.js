var React = require('react/addons');
var utils = React.addons.TestUtils


var $r = module.exports = rtq

rtq.react = React;

function rtq(element) {
  var context;

  if ( utils.isElement(element) ) {
    element = context = utils.renderIntoDocument(element)
  }
  else if ( utils.isDOMComponent(element) || utils.isCompositeComponent(element))
    context = element
  else if ( element.__isRTQ )
    context = element.context
  else 
    throw new TypeError('Wrong type: must either be ReactElement or a Component Instance')

  return new ComponentCollection(element, context)
}

function ComponentCollection(_components, context, selector){
  var components = _components == null ? [] : [].concat(_components)
    , idx = -1, len = components.length

  while( ++idx < len ) this[idx] = components[idx]

  this.length = len
  this.context = context
  this.selector = selector
  this.__isRTQ = true
}

rtq.dom = function(component){
 return React.findDOMNode(component)
}

ComponentCollection.prototype = {

  constructor: ComponentCollection,

  each: function(cb, thisArg) {
    var idx = -1, len = this.length;
    while( ++idx < len ) cb.call(thisArg, this[idx], idx, this)
    return this
  },

  map: function(cb, thisArg) {
    var idx = -1, len = this.length, result = []
    while( ++idx < len ) result.push(cb.call(thisArg, this[idx], idx, this)) 
    return result
  },

  get: function(){
    return unwrap(this.map(function(component){ return component }))
  },

  dom: function() {
    return unwrap(this.map(rtq.dom))
  },

  find: function(selector){
    var components;

    if( typeof selector === 'function') {
      components = utils.scryRenderedComponentsWithType(this.context, selector)
      selector = selector.name || '<<anonymous component>>'
    }
    else if ( !selector )
      components = utils.findAllInRenderedTree(this.context, function(){ return true })

    else if( selector === ':dom' )
      components = utils.findAllInRenderedTree(this.context, function(item){ 
        return utils.isDOMComponent(item) 
      })

    else if( selector === ':composite' )
      components = utils.findAllInRenderedTree(this.context, function(item){ 
        return !utils.isDOMComponent(item)
      })

    else if ( selector[0] === '.' )
      components = utils.scryRenderedDOMComponentsWithClass(this.context, selector.substr(1))

    else
      components = utils.scryRenderedDOMComponentsWithTag(this.context, selector)

    return new ComponentCollection(components, this.context, selector)
  },

  only: function(){
    if (this.length !== 1) throw Error('`' + this.selector +'` found: ' + this.length + ' not 1 ')
    return this.first()
  },

  single: function(selector){
    return selector 
      ? this.find(selector).only() 
      : this.only()
  },

  first: function(selector){
    return selector 
      ? this.find(selector).first() 
      : new ComponentCollection(this[0], this.context, this.selector)
  },

  last: function(selector){
    return selector 
      ? this.find(selector).last() 
      : new ComponentCollection(this[this.length - 1], this.context, this.selector)
  },

  trigger: function(event, data){
    data = data || {}

    if (event.substr(0, 2) === 'on' )
      event = event.substr(2, 1).toLowerCase() + event.substr(3)

    if ( !(event in utils.Simulate)) 
      throw new TypeError( '"' + event + '" is not a valid DOM event')

    return this.each(function(component){
      utils.Simulate[event]($r.dom(component), data)
    })
  }
}

function unwrap(arr){
  return arr && arr.length === 1 ? arr[0] : arr
}