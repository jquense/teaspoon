'use strict';

exports.__esModule = true;
exports['default'] = createCollection;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _common = require('./common');

var _common2 = _interopRequireDefault(_common);

var _utils = require('./utils');

function createCollection(ctor) {
  var $ = QueryCollection;

  function QueryCollection(element, lastCollection) {
    if (!(this instanceof QueryCollection)) return new QueryCollection(element, lastCollection);

    var elements = element == null ? [] : [].concat(element);

    if (element && _utils.isQueryCollection(element)) {
      return new element.constructor(element.get(), element);
    }

    this._isQueryCollection = true;
    this.prevObject = lastCollection;
    this.root = lastCollection ? lastCollection.root : this;

    _utils.attachElementsToCollection(this, elements);

    return ctor.call(this, elements, lastCollection);
  }

  $.fn = $.prototype = Object.create(_common2['default']);

  Object.defineProperty($.prototype, 'constructor', {
    value: $,
    enumerable: false,
    writable: true,
    configurable: true
  });

  return $;
}

module.exports = exports['default'];