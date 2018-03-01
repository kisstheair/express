/**
 * Created by seven on 2018/2/2.
 * fighting20xx@126.com
 */
//
// var http = require("http");
// var hostname='127.0.0.1';
// var port=3000;
// var server = http.createServer(function (req,response,t) {        //回调函数 第一个是 http.IncomingMessage类   在这里当做请求对象     第二个是http.ServerResponse 类    没有第三个参数。
//   console.log(req.constructor);
//   console.log(response.constructor);
//   console.log('请求信息'+ req.statusCode);
//   console.log('请求信息'+ req.headers);
//   console.log('请求信息'+ req.httpVersion);
//   console.log('请求信息'+ req.method);
//   console.log('请求信息'+ req.rawHeaders);
//   console.log('请求信息'+ req.rawTrailers);
//   console.log('请求信息'+ req.statusMessage);
//   console.log('请求信息'+ req.url);
//   console.log('请求信息33333'+ t);             // undefined
//
//
//   response.statusCode = '200';
//   response.setHeader('Content-Type','text/plain');
//   response.writeHead(200, { 'Content-Type': 'text/plain',  'Trailer': 'Content-MD5' });
//   response.write("hello world");
//   response.addTrailers({ 'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667' });
//   response.end();
// });
//
// server.listen(port,hostname,function () {
//   console.log(`服务器运行在http://${hostname}:${port}/`);
// });


var express = require('./lib/express');
var app = express();




app.use(express.static('public'));                                    // 是文件中间件 没有调用next()    http://localhost:3000/images/kitten.jpg   匹配成功，找到ketten.jpg之后 响应就结束了

// 挂载至 /user/:id 的中间件，任何指向 /user/:id 的请求都会执行它         在特定的路径之前  执行一次。
app.use('/user/:id', function (req, res, next) {
  console.log('Request Type:', req.method);
  next();
});
app.use(function (req, res, next) {
  console.log('usessssssssssssss');
  next();
});

// 路由和句柄函数(中间件系统)，处理指向 /user/:id 的 GET 请求
app.get('/user/:id', function (req, res, next) {
  res.send('USER');
});


app.param(['id', 'page'], function (req, res, next, value) {
  console.log('CALLED ONLY ONCE with', value);
  next();
})



app.use(function(req, res, next) {
  res.status(404).send('Sorry cant find that!');
});



var server = app.listen(3000, function () {
  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);
});
