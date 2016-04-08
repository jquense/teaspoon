'use strict';

exports.__esModule = true;
var _bind = Function.prototype.bind;

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

var _invariant = require('invariant');

var _invariant2 = _interopRequireDefault(_invariant);

var _bill = require('bill');

var _billNode = require('bill/node');

var _utils = require('./utils');

function noTextNodes(nodes) {
  return nodes.filter(function (node) {
    return node.nodeType !== _billNode.NODE_TYPES.TEXT;
  });
}

var $ = function $(t) {
  for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
    args[_key - 1] = arguments[_key];
  }

  return new (_bind.apply(t.constructor, [null].concat(args)))();
};

var common = {

  _reduce: function _reduce() {
    var _nodes;

    return $(this, (_nodes = this.nodes).reduce.apply(_nodes, arguments), this);
  },

  _map: function _map(cb) {
    var result = [];
    this.each(function () {
      return result.push(cb.apply(undefined, arguments));
    });
    return result;
  },

  each: function each(fn, thisArg) {
    [].forEach.call(this, fn, thisArg || this);
    return this;
  },

  end: function end() {
    return this.prevObject || this;
  },

  tap: function tap(fn) {
    fn.call(this, this);
    return this;
  },

  get: function get() {
    var result = [];
    this.each(function (el) {
      return result.push(el);
    });
    return result;
  },

  find: function find(selector) {
    var includeSelf = arguments.length <= 1 || arguments[1] === undefined ? false : arguments[1];

    return this._reduce(function (result, node) {
      return result.concat(_utils.qsa(selector, node, includeSelf));
    }, []);
  },

  traverse: function traverse(test) {
    return this._reduce(function (result, node) {
      return result.concat(_bill.findAll(node, test));
    }, []);
  },

  filter: function filter(selector) {
    if (!selector) return this;

    return this._reduce(function (result, node) {
      return _utils.matches(selector, node) ? result.concat(node) : result;
    }, []);
  },

  is: function is(selector) {
    return this.filter(selector).length === this.length;
  },

  children: function children(selector) {
    return this._reduce(function (result, node) {
      return result.concat(noTextNodes(node.children));
    }, []).filter(selector);
  },

  parent: function parent(selector) {
    return this._reduce(function (nodes, node) {
      var match = true;

      if (node = node.parentNode) {
        if (selector) match = _utils.matches(selector, node);

        if (match && nodes.indexOf(node) === -1) nodes.push(node);
      }
      return nodes;
    }, []);
  },

  parents: function parents(selector) {
    return this._reduce(function (nodes, node) {
      while (node = node.parentNode) {
        var match = true;

        if (selector) match = _utils.matches(selector, node);

        if (match && nodes.indexOf(node) === -1) nodes.push(node);
      }

      return nodes;
    }, []);
  },

  closest: function closest(selector) {
    var test = selector ? function (n) {
      return _utils.matches(selector, n);
    } : function () {
      return true;
    };

    return this._reduce(function (nodes, node) {
      do {
        node = node.parentNode;
      } while (node && !test(node));

      if (node && nodes.indexOf(node) === -1) nodes.push(node);

      return nodes;
    }, []);
  },

  text: function text() {
    return this.find(':text').nodes.reduce(function (str, node) {
      return str + node.element;
    }, '');
  },

  first: function first(selector) {
    return selector ? this.find(selector).first() : $(this, _utils.assertLength(this, 'first')[0], this);
  },

  last: function last(selector) {
    return selector ? this.find(selector).last() : $(this, _utils.assertLength(this, 'last')[this.length - 1], this);
  },

  nth: function nth(n, selector) {
    n = Math.max(0, Math.min(n, this.length));
    return selector ? this.find(selector).nth(n) : $(this, _utils.assertLength(this, 'nth')[n], this);
  },

  only: function only() {
    if (this.length !== 1) throw new Error('The query found: ' + this.length + ' items not 1');

    return this.first();
  },

  unwrap: function unwrap() {
    return this.single()[0];
  },

  elements: function elements() {
    return this.nodes.map(function (node) {
      return node.element;
    });
  }
};

var asserts = {
  none: [function (c) {
    return c.length === 0;
  }, function (c) {
    return 'The query found ' + c.length + ', but expected to find zero nodes.';
  }],
  any: [function (c) {
    return c.length !== 0;
  }, function (c) {
    return 'The query found ' + c.length + ', but expected to find 1 or more nodes.';
  }],
  single: [function (c) {
    return c.length === 1;
  }, function (c) {
    return 'The query found: ' + c.length + ' items not 1';
  }]
};

Object.keys(asserts).forEach(function (name) {
  var _asserts$name = asserts[name];
  var test = _asserts$name[0];
  var msg = _asserts$name[1];

  common[name] = function (selector) {
    if (selector) return this.find(selector)[name]();

    _invariant2['default'](test(this), msg(this));
    return this;
  };
});

// return values
['every', 'some'].forEach(function (method) {
  var fn = Array.prototype[method];

  common[method] = function () {
    for (var _len2 = arguments.length, args = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
      args[_key2] = arguments[_key2];
    }

    return fn.apply(this, args);
  };
});

// return collections
['map', 'reduce', 'reduceRight'].forEach(function (method) {
  var fn = Array.prototype[method];

  common[method] = function () {
    for (var _len3 = arguments.length, args = Array(_len3), _key3 = 0; _key3 < _len3; _key3++) {
      args[_key3] = arguments[_key3];
    }

    return $(this, fn.apply(this, args));
  };
});

var aliases = {
  get: 'toArray',
  each: 'forEach'
};

Object.keys(aliases).forEach(function (method) {
  return common[aliases[method]] = common[method];
});

exports['default'] = common;
module.exports = exports['default'];