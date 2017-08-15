//userAgent设置为iPhone的ua无法抓取到内容，设置为iPad就可以
var system = require('system'),
	  args   = system.args,
	  keyword, device, address, startTime,
	  page   = require('webpage').create(),
    configMap = {
	    iphone5 : {
		    ua     : 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		    width  : 360,
		    height : 640
	    },
	    iphone6 : {
	    	ua     : 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		    width  : 375,
		    height : 667
	    },
	    ipad    : {
	    	ua     : 'Mozilla/5.0 (iPad; CPU OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1',
		    width  : 768,
		    height : 1024
	    }
    };

startTime = Date.now();

keyword = args[1] || 'iphone'; //查询关键字
device  = args[2] || 'ipad'; //模拟设备名称

address = 'https://www.baidu.com/s?wd=' + encodeURIComponent(keyword);
console.log( page.settings.userAgent );
console.log( configMap[device].ua );
page.settings.userAgent = configMap[device].ua;
page.viewportSize = {
	width  : configMap[device].width,
	height : configMap[device].height
};


phantom.outputEncoding = 'gb2312';

page.open(address, function(status){
	var result = null;
	if( status !== 'success' ){
		console.log('抓取失败');
		result = {
			code   : 0,
			msg    : '抓取失败',
			word   : keyword,
			device : device,
			time   : Date.now() - startTime
		};
	}
	else{
		var dataList = page.evaluate(function(){
			var content = document.querySelectorAll('.result'),
				  item, i, len,
				  args = [];
			for( i=0,len=content.length; i<len; i++ ){
				item = content[i];
				console.log( item.className );
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
			device   : device,
			time     : Date.now() - startTime,
			dataList : dataList
		};
	}
	console.log( JSON.stringify(result, null, 2) );
	page.render(device+'.png');
	phantom.exit();
});