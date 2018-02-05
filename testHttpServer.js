/**
 * Created by seven on 2018/2/2.
 * fighting20xx@126.com
 */

var http = require("http");
var hostname='127.0.0.1';
var port=3000;
var server = http.createServer(function (req,response) {        //回调函数 第一个是 http.IncomingMessage类   在这里当做请求对象     第二个是http.ServerResponse 类
  console.log(req.constructor);
  console.log(response.constructor);
  console.log('请求信息'+ req.statusCode);
  console.log('请求信息'+ req.headers);
  console.log('请求信息'+ req.httpVersion);
  console.log('请求信息'+ req.method);
  console.log('请求信息'+ req.rawHeaders);
  console.log('请求信息'+ req.rawTrailers);
  console.log('请求信息'+ req.statusMessage);
  console.log('请求信息'+ req.url);


  response.statusCode = '200';
  response.setHeader('Content-Type','text/plain');
  response.writeHead(200, { 'Content-Type': 'text/plain',  'Trailer': 'Content-MD5' });
  response.write("hello world");
  response.addTrailers({ 'Content-MD5': '7895bf4b8828b55ceaf47747b4bca667' });
  response.end();
});

server.listen(port,hostname,function () {
  console.log(`服务器运行在http://${hostname}:${port}/`);
});



