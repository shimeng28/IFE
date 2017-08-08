var page = require('webpage').create(),
	  system = require('system'),
    keyword, address, startTime;

startTime = Date.now(); //初始时间
keyword = system.args[1]; //输入的参数 即要查询的关键字
address = 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword);
console.log(address);
page.open( address, function(status){
	var result = null;
	console.log('start: ');
	if( status !== 'success' ){
		console.log( '抓取失败' );
		result = {
			code: 0,
			msg: '抓取失败',
			word: keyword,
			time: Date.now() - startTime
		};
	}
	else{
		var dataList =	page.evaluate(function(){
				var content = document.querySelectorAll('.result'),arr=[],
					i, len;
				for( i=0, len=content.length; i<len; i++ ){
					var item = content[i];
					arr.push({
						title : item.querySelector('.t').textContent,
						info  : item.querySelector('.c-abstract').textContent,
						link  : item.querySelector('.t > a').href,
						pic   : item.querySelector('.c-img') ? item.querySelector('.c-img').src : 'no picture'
					});
				}
				return arr;
			});
		console.log('dataList : ' + dataList );
		result = {
			code : 1,
			msg  : '抓取成功',
			word : keyword,
			time : Date.now() - startTime,
			dataList: dataList
		};
	}
	phantom.outputEncoding = 'gb2312'; //中文乱码解决方案
	console.log( JSON.stringify(result, undefined, 2) );
	console.log('ending');
	phantom.exit();
});


//以下为练习代码
/*
var page = require('webpage').create();
page.open('http://www.baidu.com', function(status){
	var url = page.url;
	console.log('URL: ' + url );
	phantom.exit();
});
*/

/*
var page = require('webpage').create();
page.customHeaders = {
	'X-Test' : 'foo',
	'DNT'    : '1'
};
*/

/*
var page = require('webpage').create();
page.open('http://www.baidu.com', function(status) {
	var cookies = page.cookies;
	console.log('Listening cookies: ');
	for (var i in cookies) {
		console.log(cookies[i].name + '=' + cookies[i].value);
	}
	phantom.exit();
});
*/

/*var page = require('webpage').create();
console.log('The default user agent is ' + page.settings.userAgent)
page.settings.userAgent = 'SpecialAgent';
page.open('http://www.baidu.com/s?wd=q', function( status ){
	if( status !== 'success' ){
		console.log('Unable to access network');
	}
	else{
		var ua = page.evaluate(function(){
			return document.getElementById('content_left').textContent;
		});
		console.log( ua );
	}
	phantomjs.exit();
});
*/


/*var page = require('webpage').create();

page.clipRect = {
	left   : 0,
	top    : 0,
	width  : 1024,
	height : 768
};
page.open('http://www.baidu.com', function(status){
	console.log( 'Success is ' + status );
		page.render('hello.pdf');
});*/


/*
var page = require('webpage').create();
page.open('http://github.com', function( status ){
	console.log('Success : ' + status );
	if( status === 'success' ){
		console.log( page.content );
		phantom.exit();
	}
});
*/

/*

var page = require('webpage').create();
page.open('http://github.com/', function( status ){
	console.log('Status is ' + status );
	if( status === 'success' ){
		page.render('github.png');
		phantom.exit();
	}
} );
*/

/*
var page = require('webpage').create(),
    system = require('system'), t, address;
if( system.args.length === 1 ){
	console.log('Usage : loadspeed.js<some url');
}
t = Date.now();
address = system.args[1];
page.open( address , function( status ){
	if( status !== 'success' ){
		console.log('fail');
	}
	else{
		t = ( Date.now() - t )/1000;
		console.log( 'Loading ' + system.args[1] );
		console.log( 'Loading' + t + 'sec' );
	}
	phantomjs.exit();
});
*/

/*
var page = require('webpage').create();

page.onResourceRequested = function( request ){
	console.log('Request '+JSON.stringify(request, undefined, 4));
};

page.onResourceReceived = function( response ){
	console.log('Receive ' + JSON.stringify( response, undefined, 4));
};
page.open( 'http://www.baidu.com' );
*/

/*var page = require('webpage').create();
page.onConsoleMessage = function( msg ){
	console.log('Page title is ' + msg );
};

page.open( 'http://www.baidu.com', function( status ){
	page.evaluate(function(){
		console.log(document.title);
	});
	phantomjs.exit();
} );*/


/*
var page   = require('webpage').create(),
	  system = require('system'),
	  t, address;

if( system.args.length===1 ){
	console.log('Usage: loadspeed.js<some URL');
	phantom.exit();
}

t = Date.now();
address = system.args[1];

page.open( address, function( status ){
	if( status !== 'success' ){
		console.log('FAIL to load the address');
	}
	else{
		t = Date.now() - t;
		console.log( 'Loading ' + system.args[1] );
		console.log( 'Loading time ' + t + ' msec' );
	}
	phantom.exit();
} );
*/


/*
var page = require('webpage').create();
page.open('https://www.baidu.com/', function( status ){
	console.log('Status: ' + status);
	if( status === 'success' ){
		page.render('example.png');
	}
	phantom.exit();
});*/
