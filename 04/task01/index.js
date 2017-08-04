//
// 整个色彩选择器可以分为三个变量  颜色（0-360）和亮度（0-1.0)
// 总结 ：颜色没有表示完全

var colorPicker = (function( window, document ){
	var configMap,    colorConvert,       panelGradient,  getBandPointColor,
		  getStyle,     CanvasFactory,      panelClick,     bandClick,
		  movePoint,    setPanelColor,      updateDisInfo,  getEventCoordinate,
		  getDisInfo,   changeColorByClick, changeColorByInput, updateColor,
		  addEvent,     sequenceExecute,    eventHandler,    init;
	
	configMap = {
		panelCanvas      : null,
		bandCanvas       : null,
		
		bandPoint        : null,
		
		drawPanel        : null,
		disPanel         : document.getElementById( 'disPanel' ),
		rgbColor         : null,
		hslColor         : null,
		
		infoMap          : {
			colorPanel : document.getElementById( 'disPanel' ),
			
			disInfoWrap : document.getElementById('inputInfo'),
			r : document.getElementById('colorR'),
			g : document.getElementById('colorG'),
			b : document.getElementById('colorB'),
			
			h : document.getElementById('colorH'),
			s : document.getElementById('colorS'),
			l : document.getElementById('colorL'),
			
			rgbResult : document.getElementById('rgbResult'),
			hslResult : document.getElementById('hslResult')
		}
	};
	
	
	//具体算法参考http://blog.csdn.net/jiangxinyu/article/details/8000999
	colorConvert = {
		rgbTohsl: function (rgb) {
			var r = rgb[0] / 255,
				 g = rgb[1] / 255,
				 b = rgb[2] / 255;
			var min = Math.min.apply(Array, [r, g, b]),
				max = Math.max.apply(Array, [r, g, b]);
			var h, s, l;
			if (max === min) {
				h = 0;
			}
			else if (max === r && g >= b) {
				h = 60 * (g - b) / (max - min);
			}
			else if (max === r && g < b) {
				h = 60 * (g - b) / (max - min) + 360;
			}
			else if (max === g) {
				h = 60 * (b - r) / (max - min) + 120;
			}
			else if (max === b) {
				h = 60 * (r - g) / (max - min) + 240;
			}
			l = (max + min) / 2;
			if (l === 0 || max === min) {
				s = 0;
			}
			else if (l > 0 && l <= 0.5) {
				s = (max - min) / (2 * l);
			}
			else if (l > 0.5) {
				s = (max - min) / (2 - 2 * l);
			}
			return [Math.round(h), Math.round(s * 100) / 100, Math.round(l * 100) / 100];
		
	 },
		
		hslToRgb : function( hsl ) {
			var h = hsl[0],
				  s = hsl[1],
				  l = hsl[2],
			    r, g, b,
			    p, q, k;
			
			if( s === 0 ){
				r = g = b = l;
			}
			else if( l<0.5 ){
				q = l * ( 1 + s );
			}
			else if (l >= 0.5) {
				q = l + s - (l * s);
			}
			p = 2 * l - q;
			k = h / 360;
			
			r = singleColorCalculation(k + 1 / 3);
			g = singleColorCalculation(k);
			b = singleColorCalculation(k - 1 / 3);
			
			return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
			
			function singleColorCalculation(k) {
				
				var color;
				
				if (k < 0) {
					k += 1;
				}
				if (k > 1) {
					k -= 1;
				}
				
				if (k * 6 < 1) {
					color = p + ((q - p) * 6 * k);
				}
				else if (k * 6 >= 1 && k < 0.5) {
					color = q;
				}
				else if (k >= 0.5 && 3 * k < 2) {
					color = p + ((q - p) * 6 * (2 / 3 - k));
				}
				else {
					color = p;
				}
				
				return color;
				
			}
		}
	};
	getStyle     = function( ele, prop ){
		return parseInt( document.defaultView.getComputedStyle( ele, null )[prop] );
	};
	
	
	addEvent     = function( ele, type, handler ){
		if( ele.addEventListener ){
			this.addEvent = function( ele, type, handler ){
				ele.addEventListener( type, handler, false );
			};
		}
		else if( ele.attachEvent ){
			this.addEvent = function( ele, type, handler ){
				ele.attachEvent( type, handler );
			}
		}
		else{
			this.addEvent = function( ele, type, handler ){
				ele[ 'on'+type ] = handler;
			}
		}
		this.addEvent( ele, type, handler );
	};
	//事件点击坐标位置
	getEventCoordinate = function( event ){
		var pageX = event.pageX,
			pageY = event.pageY;
		
		if (pageX === undefined) {
			pageX = event.clientX + Math.max(document.body.scrollLeft, document.documentElement.scrollLeft);
		}
		if (pageY === undefined) {
			pageY = event.clientY + Math.max(document.body.scrollTop, document.documentElement.scrollTop);
		}
		
		return {
			x: pageX,
			y: pageY
		};
	};
	
	
	//画布构造函数
	CanvasFactory = function( dom, point ){
		this.dom      = dom;
		this.point    = point;
		this.limitMap = this.dom.getBoundingClientRect();
	};
	CanvasFactory.prototype = {
		contructor   : CanvasFactory,
		pointInPath  : function( coordMap, limitMap, diff ){
			diff = diff || 0;
			return coordMap.x <= limitMap.right  + diff
				&&   coordMap.x >= limitMap.left   - diff
				&&   coordMap.y >= limitMap.top    - diff
				&&   coordMap.y <= limitMap.bottom + diff;
		},
		setPointCoord: function( prop, num ){
			//设置point坐标位置
			//坐标位置等于点击时在页面内的坐标 - 点击对象的left和top距离
			this.point.style[ prop ] =
				num - getStyle(this.point, 'width')/2 - getStyle( this.point, 'borderWidth') - this.limitMap[prop] + 'px' ;
		},
		getCanvasColor     : function(){
			return this.dom.getContext('2d').getImageData(
				getStyle( this.point, 'left' ) + Math.round(getStyle( this.point, 'width' )/2),
				getStyle( this.point, 'top' )  + Math.round(getStyle( this.point, 'height')/2),
				1, 1 );
		}
	};
	//绘制色板和色带
	//色带控制360度颜色
	//色板控制亮度0-1.0
	//色板上显示输入的颜色，包括点击获取的颜色
	panelGradient = function( canvas, width, height ){
		var context = canvas.getContext( '2d' ),
		    lightGradient = context.createLinearGradient( 0, 0, 0, height );
		
		lightGradient.addColorStop( 0, 'rgba(0, 0, 0, 0)' );
		lightGradient.addColorStop( 1, 'rgba(0, 0, 0, 0.5)' );
		
		return {
			render : function( color ){
				context.clearRect(0, 0, width, height );
				var colorGradient = context.createLinearGradient( 0, 0, width, 0 );
				colorGradient.addColorStop( 0, 'rgb(255, 255, 255)' );
				colorGradient.addColorStop( 1,  color );
				
				context.fillStyle = colorGradient;
				context.fillRect( 0, 0, width, height );
				
				context.fillStyle = lightGradient;
				context.fillRect( 0, 0, width, height );
			}
		}
	};

	//色带point所在处的颜色值
	getBandPointColor = function(){
		var point   = configMap.bandCanvas.point,
		    height  = getStyle(point , 'height'),
		    top     = getStyle( point, 'top' ),
		    distance = height/2 + top + getStyle(point, 'borderTopWidth');
		
		return {
			distance : distance,
			hslColor : [ Math.round( distance*360/500 ) , 1, 0.5 ]
		};
	};
	//设置色板的颜色
	setPanelColor = function(  rgbColor  ){
		var bandRgbColor = 'rgb( ' + rgbColor.join(',') + ')';
		configMap.drawPanel.render( bandRgbColor );
	};
	//要显示的颜色值
	getDisInfo    = function(){
		var rgbColor = configMap.panelCanvas.getCanvasColor().data.slice(0, 3),
		    hslColor = colorConvert.rgbTohsl( rgbColor );
		
		inputChose.rgbArr = rgbColor;
		inputChose.hslArr = hslColor;
		
		updateDisInfo();
	};
	//更新显示结果信息
	updateDisInfo = function( ){
		
		var infoEleMap = configMap.infoMap,
		    rgbColor   = inputChose.rgbArr,
			  hslColor   = inputChose.hslArr;
		
		infoEleMap.colorPanel.style.backgroundColor = 'rgb( ' + rgbColor.join(', ') + ' )';
		infoEleMap.r.value = rgbColor[0];
		infoEleMap.g.value = rgbColor[1];
		infoEleMap.b.value = rgbColor[2];
		
		infoEleMap.h.value = hslColor[0];
		infoEleMap.s.value = hslColor[1];
		infoEleMap.l.value = hslColor[2];
		
		infoEleMap.rgbResult.innerHTML = 'rgb(' + rgbColor.join(', ') + ')';
		infoEleMap.hslResult.innerHTML = 'hsl(' + hslColor.join(', ') + ')';
	};
	
	//输入框 输入内容处理
	inputChose = {
		rgbArr : [],
		hslArr : [],
		//颜色值检查
		colorCheckIn : function( type, minNum, maxNum, addNum ){
			var inputEle = configMap.infoMap[type],
			    value    = Number(inputEle.value) + addNum;
			
			minNum = minNum || 0;
			
			if( typeof value !== 'number' || value > maxNum || value < minNum ){
				return false;
			}
			inputEle.value = Number( value.toFixed(2) );
			return true;
		},
		rgbRecord : function(){
			var eleMap = configMap.infoMap;
			
			this.rgbArr[0] = Number(eleMap.r.value) ;
			this.rgbArr[1] = Number(eleMap.g.value) ;
			this.rgbArr[2] = Number(eleMap.b.value) ;
			
			this.hslArr = colorConvert.rgbTohsl( this.rgbArr );
		},
		hslRecord : function(){
			var eleMap = configMap.infoMap;
			this.hslArr[0] = Number(eleMap.h.value) ;
			this.hslArr[1] = Number(eleMap.s.value) ;
			this.hslArr[2] = Number(eleMap.l.value) ;
			
			this.rgbArr = colorConvert.hslToRgb( this.hslArr );
		}
	};
	//移动point
	movePoint = function(){
		var hslColor  = inputChose.hslArr,
			bandCanvas  = configMap.bandCanvas,
			panelCanvas = configMap.panelCanvas;
		
		bandCanvas.setPointCoord( 'top', bandCanvas.limitMap.top +hslColor[0]*500/360 );
		
		panelCanvas.setPointCoord( 'top',  panelCanvas.limitMap.top  + hslColor[1]*350 );
		panelCanvas.setPointCoord( 'left',   panelCanvas.limitMap.left + hslColor[2]*500 );
		
	};
	//改变颜色
	updateColor = function( type, addNum ){
		var checkResult, maxNum, category;
		if( 'rgb'.indexOf(type) > -1 ){
			maxNum = 255;
			category = 'rgb';
		}
		else{
			maxNum = 1;
			if( type === 'h' ) maxNum = 360;
			category = 'hsl';
		}
		checkResult = inputChose.colorCheckIn( type,0, maxNum, addNum );
		if( !checkResult ) return false;
		inputChose[category + 'Record']();
		movePoint();
		setPanelColor( colorConvert.hslToRgb( getBandPointColor().hslColor ) );
		updateDisInfo();
	};
	
	
	
	//色板内 点击处理事件
	panelClick = function( event ){
		var eventCoord,
			_this = configMap.panelCanvas;
		event = event || window.event;
		eventCoord = getEventCoordinate(event);
		//如果在canvas内， 设置point坐标
		if( _this.pointInPath(eventCoord, _this.limitMap, Math.round( getStyle(_this.point,"width")/2 )) ){
			_this.setPointCoord( 'left', eventCoord.x-Math.round( getStyle(_this.point, 'width')/2 ) );
			_this.setPointCoord( 'top',  eventCoord.y-Math.round( getStyle(_this.point, 'height')/2 ) );
			
			getDisInfo();
		}
	};
	//色带内 click处理事件
	bandClick = function( event ){
		var eventCoord, bandColor,
			_this = configMap.bandCanvas;
		event = event || window.event;
		eventCoord = getEventCoordinate( event );
		if( _this.pointInPath(eventCoord, _this.limitMap, Math.round( getStyle(_this.point,"width")/2 )) ){
			_this.setPointCoord( 'top',  eventCoord.y-Math.round( getStyle(_this.point, 'height')/2 ) );
			
			setPanelColor( colorConvert.hslToRgb( getBandPointColor().hslColor ) );
			getDisInfo();
		}
	};
	//点击按钮改变颜色
	changeColorByClick = function( event ){
		var addOrLess, type, target ,
			addNum=1;
		event = event || window.event;
		
		target     = event.target || event.srcElement;
		addOrLess  = target.className.slice(0, -1);
		type       = target.className.slice(-1).toLowerCase();
		
		if( type==='s' || type==='l' ) addNum = 0.01;
		switch (addOrLess){
			case 'addBtn':
				updateColor( type, +addNum );
				break;
			case 'lessBtn':
				updateColor( type, -addNum );
				break;
			default:
				return;
		}
	};
	//输入框输入参数改变颜色
	changeColorByInput = function(){
		var type, target;
		event = event || window.event;
		
		target     = event.target || event.srcElement;
		type       = target.id.slice(-1).toLowerCase();
		updateColor( type, 0 );
	};
	
	
	
	
	init  = function(){
		//项目初始化
		
		//初始化 项目信息
		configMap.bandCanvas  = new CanvasFactory( document.getElementById( 'band' ), document.getElementById( 'bandPoint' ));
		configMap.panelCanvas = new CanvasFactory( document.getElementById('panel'),  document.getElementById( 'panelPoint' ) );
		
		
		configMap.drawPanel = panelGradient( configMap.panelCanvas.dom, 350, 500 );
		/*setPanelColor( colorConvert.hslToRgb( getBandPointColor().hslColor ) );
		getDisInfo();*/
		
		inputChose.rgbRecord();
		setPanelColor( inputChose.rgbArr );
		movePoint();
		updateDisInfo();
	};
	
	//事件处理函数
	eventHandler    = function() {
		addEvent( configMap.bandCanvas.dom,      'click',  bandClick  );
		addEvent( configMap.panelCanvas.dom,     'click',  panelClick );
		addEvent( configMap.infoMap.disInfoWrap, 'click',  changeColorByClick );
		addEvent( configMap.infoMap.r,           'blur',   changeColorByInput );
		addEvent( configMap.infoMap.g,           'blur',   changeColorByInput );
		addEvent( configMap.infoMap.b,           'blur',   changeColorByInput );
		addEvent( configMap.infoMap.h,           'blur',   changeColorByInput );
		addEvent( configMap.infoMap.s,           'blur',   changeColorByInput );
		addEvent( configMap.infoMap.l,           'blur',   changeColorByInput );
	};
	
	//顺序执行
	sequenceExecute = function( ){
		var args = Array.prototype.slice.call( arguments, 0 );
		args.forEach( function( fn ){
			if( Object.prototype.toString.call( fn ).slice(8, -1) === 'Function' ){
				fn();
			}
		} );
	};
	sequenceExecute( init, eventHandler );
	
})( window, document, undefined );
