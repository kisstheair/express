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

var pathRegexp = require('path-to-regexp');
var debug = require('debug')('express:router:layer');

/**
 * Module variables.
 * @private
 */

var hasOwnProperty = Object.prototype.hasOwnProperty;

/**
 * Module exports.
 * @public
 */

module.exports = Layer;

function Layer(path, options, fn) {
  if (!(this instanceof Layer)) {
    return new Layer(path, options, fn);          // 省略new 的用法。  无new创建实例。
  }

  debug('new %o', path)
  var opts = options || {};

  this.handle = fn;                                         //表示 中间件函数  或者数组。
  this.name = fn.name || '<anonymous>';                    //中间件函数的名字，如果是匿名则函数为 '<anonymous>'
  this.params = undefined;                                  // undefined 在执行match的时候赋值                               在执行的过程中，通过调用match 将匹配的参数放到这里面
  this.path = undefined;                                     //undefined 在执行match的时候赋值
  this.regexp = pathRegexp(path, this.keys = [], opts);      // 路径的正则表达式 ,将路径字符串（如用户名）转换为正则表达式。    给定path之后  这个layer 的 keys 就定了（有几个变量，，，，）

  // set fast path flags
  this.regexp.fast_star = path === '*'
  this.regexp.fast_slash = path === '/' && opts.end === false
}

/**
 * Handle the error for the layer.
 *
 * @param {Error} error
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @api private
 */

Layer.prototype.handle_error = function handle_error(error, req, res, next) {
  var fn = this.handle;

  if (fn.length !== 4) {
    // not a standard error handler
    return next(error);
  }

  try {
    fn(error, req, res, next);
  } catch (err) {
    next(err);
  }
};

/**
 * Handle the request for the layer.
 *
 * @param {Request} req
 * @param {Response} res
 * @param {function} next
 * @api private
 */

Layer.prototype.handle_request = function handle(req, res, next) {
  var fn = this.handle;

  if (fn.length > 3) {
    // not a standard request handler     不是标准的请求处理程序
    return next();
  }

  try {
    fn(req, res, next);
  } catch (err) {
    next(err);                                // 如果有一场，那就接着向下执行，遍历 route中的方法。
  }
};

/**
 * Check if this route matches `path`, if so
 * populate `.params`.
 *
 * @param {String} path
 * @return {Boolean}
 * @api private
 */

Layer.prototype.match = function match(path) {        // 匹配一下，返回是否匹配的上， 并修改匹配的参数
  var match

  if (path != null) {
    // fast path non-ending match for / (any path matches)
    if (this.regexp.fast_slash) {
      this.params = {}
      this.path = ''
      return true
    }

    // fast path for * (everything matched in a param)
    if (this.regexp.fast_star) {
      this.params = {'0': decode_param(path)}
      this.path = path
      return true
    }

    // match the path                                                  exec 会返回捕获结果， 并且有分组结果  【第一个总结果，第二个是分组的第一个，第三个是分组的第二个，，，，，，】
    match = this.regexp.exec(path)
  }

  if (!match) {
    this.params = undefined;
    this.path = undefined;
    return false;
  }

  // store values
  this.params = {};
  this.path = match[0]

  var keys = this.keys;
  var params = this.params;

  for (var i = 1; i < match.length; i++) {                                       //app.get('/user/:id', func)  如果路径是这个，  那么keys就是 变量的数组【name:id】   这里应该取出的是分组结果。
    var key = keys[i - 1];
    var prop = key.name;
    var val = decode_param(match[i])

    if (val !== undefined || !(hasOwnProperty.call(params, prop))) {
      params[prop] = val;                                                         // 如果请求是http://127.0.0.1:3000/user/abc?ttt=123   那么params就是 {id=abc} 把匹配的值加上去。
    }
  }

  return true;
};

/**
 * Decode param value.
 *
 * @param {string} val
 * @return {string}
 * @private
 */

function decode_param(val) {
  if (typeof val !== 'string' || val.length === 0) {
    return val;
  }

  try {
    return decodeURIComponent(val);
  } catch (err) {
    if (err instanceof URIError) {
      err.message = 'Failed to decode param \'' + val + '\'';
      err.status = err.statusCode = 400;
    }

    throw err;
  }
}
