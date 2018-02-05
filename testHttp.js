/**
 * Created by seven on 2018/2/2.
 * fighting20xx@126.com
 */



var http = require("http");
var postData ="safdasfasdf"
var option = {
  hostname:"www.baidu.com",
  method:"get",
  headers:{
    'Content-Type':'application/x-www-form-urlencoded'
  },
  timeout:1000
};

var req = http.request(option,function (res) {     // 回调函数 第一个是 http.IncomingMessage类    在这里当做响应对象
  console.log('请求信息'+ res.statusCode);
  console.log('请求信息'+ res.headers);
  console.log('请求信息'+ res.httpVersion);
  console.log('请求信息'+ res.method);
  console.log('请求信息'+ res.rawHeaders);
  console.log('请求信息'+ res.rawTrailers);
  console.log('请求信息'+ res.statusMessage);
  console.log('请求信息'+ res.url);
  res.on('data', function (chunk) {
      console.log(`响应主体: ${chunk}`);
  });
  res.on('end',function () {
      console.log('响应中已无数据。');
  });
});

req.on('end',function () { console.log("end!");});
req.on('error',function (e) { console.log(`请求遇到问题: ${e.message}`);});
req.write(postData);
req.end();


