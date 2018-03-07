/*!
 * express
 * Copyright(c) 2009-2013 TJ Holowaychuk
 * Copyright(c) 2013 Roman Shtylman
 * Copyright(c) 2014-2015 Douglas Christopher Wilson
 * MIT Licensed
 */

'use strict';

/**
 * Module dependencies.
 * @private
 */

var debug = require('debug')('express:router:route');
var flatten = require('array-flatten');
var Layer = require('./layer');
var methods = require('methods');

/**
 * Module variables.
 * @private
 */

var slice = Array.prototype.slice;
var toString = Object.prototype.toString;

/**
 * Module exports.
 * @public
 */

module.exports = Route;

/**
 * Initialize `Route` with the given `path`,
 *
 * @param {String} path
 * @public
 */

function Route(path) {
  this.path = path;
  this.stack = [];                                 //stack数组其实保存的也是Layer对象

  debug('new %o', path)

  // route handlers for various http methods         用于各种HTTP方法的路由处理程序
  this.methods = {};                                //记录使用了那些方法  {get:true,post:true.put:true}
}

/**
 * Determine if the route handles a given method.
 * @private
 */

Route.prototype._handles_method = function _handles_method(method) {          // 判断时候有那种处理方法的函数
  if (this.methods._all) {
    return true;
  }

  var name = method.toLowerCase();

  if (name === 'head' && !this.methods['head']) {
    name = 'get';
  }

  return Boolean(this.methods[name]);
};    // 判断时候有那种处理方法的函数

/**
 * @return {Array} supported HTTP methods
 * @private
 */

Route.prototype._options = function _options() {
  var methods = Object.keys(this.methods);

  // append automatic head
  if (this.methods.get && !this.methods.head) {
    methods.push('head');
  }

  for (var i = 0; i < methods.length; i++) {
    // make upper case
    methods[i] = methods[i].toUpperCase();
  }

  return methods;
};    //获取所有请求方法类型的数组

/**
 * dispatch req, res into this route
 * @private
 */

Route.prototype.dispatch = function dispatch(req, res, done) {
  var idx = 0;
  var stack = this.stack;
  if (stack.length === 0) {
    return done();
  }

  var method = req.method.toLowerCase();
  if (method === 'head' && !this.methods['head']) {
    method = 'get';
  }

  req.route = this;

  next();

  function next(err) {
    // signal to exit route
    if (err && err === 'route') {
      return done();
    }

    // signal to exit router
    if (err && err === 'router') {
      return done(err)
    }

    var layer = stack[idx++];
    if (!layer) {                                                  // done 是总体的next函数，  这里的next是局部的下一个函数，   这里遍历stack， 遍历结束之后 执行done
      return done(err);
    }

    if (layer.method && layer.method !== method) {                  //这里相当于遍历了， 再次执行next函数， idx++了。  遍历各种方法， get  put  post  。。。
      return next(err);                                              // 这里的return 仅仅是中断作用，  next是便利的作用。并不返回任何值。
    }
                                                                     // 这里遍历的是 通过all ---layer   或者 通过get ---》get.layer     post---》post.layer 对应上的才会执行。
    if (err) {
      layer.handle_error(err, req, res, next);                      // 这里只会执行一次， 如果不匹配，那就直接跳过了，直到配配得上 才执行下面的。
    } else {
      layer.handle_request(req, res, next);
    }
  }
};

/**
 * Add a handler for all HTTP verbs to this route.
 *
 * Behaves just like middleware and can respond or call `next`
 * to continue processing.
 *
 * You can use multiple `.all` call to add multiple handlers.
 *
 *   function check_something(req, res, next){
 *     next();
 *   };
 *
 *   function validate_user(req, res, next){
 *     next();
 *   };
 *
 *   route
 *   .all(validate_user)
 *   .all(check_something)
 *   .get(function(req, res, next){
 *     res.send('hello world');
 *   });
 *
 * @param {function} handler
 * @return {Route} for chaining
 * @api public
 */

Route.prototype.all = function all() {
  var handles = flatten(slice.call(arguments));

  for (var i = 0; i < handles.length; i++) {
    var handle = handles[i];

    if (typeof handle !== 'function') {
      var type = toString.call(handle);
      var msg = 'Route.all() requires a callback function but got a ' + type
      throw new TypeError(msg);
    }

    var layer = Layer('/', {}, handle);
    layer.method = undefined;

    this.methods._all = true;
    this.stack.push(layer);
  }

  return this;
};

methods.forEach(function(method){
  Route.prototype[method] = function(){                         //route.get(function())  是在route上直接添加 cb  不是直接用路径的方式（'/a',cb）
    var handles = flatten(slice.call(arguments));

    for (var i = 0; i < handles.length; i++) {         // 一般只有一个 函数，  这里竟然为多个函数做准备了。
      var handle = handles[i];

      if (typeof handle !== 'function') {
        var type = toString.call(handle);
        var msg = 'Route.' + method + '() requires a callback function but got a ' + type
        throw new Error(msg);                                                                    // 必须为函数，要不然报异常。
      }

      debug('%s %o', method, this.path)

      var layer = Layer('/', {}, handle);                                     // route不需要匹配路径， 在router中的layer已经匹配好了路径----找到这个对应的route就行了，  所有路径无所谓。
      layer.method = method;

      this.methods[method] = true;                                             // 记录使用过那些方法。
      this.stack.push(layer);
    }

    return this;
  };
});
