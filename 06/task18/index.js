//命令行 phantomjs.exe index.js q

var page    = require( 'webpage' ).create(),
	  system  = require( 'system'  ),
    keyword, address, startTime;

startTime = Date.now();
keyword = system.args[1];
address = 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword);

page.open(address, function(status){
	var result = null;
	if( status !== 'success' ){
		console.log('抓取失败');
		result = {
			code : 0,
			msg  : '抓取失败',
			word : keyword,
			time : Date.now() - startTime
		};
	}
	else{
	  var dataList = page.evaluate(function(){
	  	var content = document.querySelectorAll('.result'),
		      item, i, len,args = [];
	  	for( i=0,len=content.length; i<len; i++ ){
	  		item = content[i];
	  		args.push(
	  			{
				    title : item.querySelector('.t').textContent,
				    info  : item.querySelector('.c-abstract').textContent,
				    link  : item.querySelector('.t > a').href,
				    pic   : item.querySelector('.c-img') ? item.querySelector('.c-img').src : 'no picture'
			   }
			  );
		  }
	  	return args;
	  });
	  result = {
		  code     : 1,
		  msg      : '抓取成功',
		  word     : keyword,
		  time     : Date.now() - startTime,
		  dataList : dataList
	  }
	}
	phantom.outputEncoding = 'gb2312'; //字符编码
	console.log( JSON.stringify(result, undefined, 2) );
	phantom.exit();
});

