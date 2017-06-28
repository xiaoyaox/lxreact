const http = require('http'),//引入http模块
express = require('express'),//引入epxress模块
app = express();// 初始化(将express执行一次即完成初始化)
var router = express.Router();
var path = require('path');
var listenPort = '10088';
/*
 *搭建一个服务器，直接传入初始化后的app即可，listen后为监听端口号
 **/
http.createServer(app).listen(listenPort,function(){
	console.log('正常打开10086端口');
	console.log('node express server successfully started.');
	console.log('Serving files at: http://localhost:'+listenPort);
	console.log("Press Ctrl+C to shutdown.");
});

app.use('/static',express.static('dist/static'));

router.get('/', function(req, res) {
	res.sendFile(__dirname + '/dist/index.html')
});

// app.get('/template/联系人信息导入模板.xlsx', function(req, res,next) {
// 	res.download(__dirname + '/dist/template/联系人信息导入模板.xlsx',"联系人信息导入模板.xlsx");
// });
// app.get('/template/系统用户信息导入模板.xlsx', function(req, res,next) {
// 	res.download(__dirname + '/dist/template/系统用户信息导入模板.xlsx',"系统用户信息导入模板.xlsx");
// });

router.get('/*', function(req, res) {
	res.sendFile(__dirname + '/dist/index.html')
});

app.use('/',router);
// module.export = router;
