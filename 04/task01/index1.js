
var colorPicker = (function( window, document ){
	var configMap, colorConvert,  drawGradient,  bandGradient,
		  getStyle,  CanvasFactory, panelClick,    bandClick,
		  inputColorInfoChange,     setPanelColor, updateDisInfo,
	    getEventCoordinate,       addEvent,      removeEvent,
		  setConfigColor,          changeColorByClick,
		  sequenceExecute,          eventHandler,  init
	 ;

	 configMap = {
	 	 panelCanvas      : null,
		 bandCanvas       : null,
		 
		 panelPoint       : document.getElementById( 'panelPoint' ),
		 bandPoint        : document.getElementById( 'bandPoint'  ),
		 
		 disPanel         : document.getElementById( 'disPanel' ),
		 drawPanel        : null,
		 colorCache       : {
	 	 	 r   : null,
			 g   : null,
			 b   : null,
			 rgb : null,
			 
			 h   : null,
			 s   : null,
			 l   : null,
			 hsl : null
		 },
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
		 },
		 checkValue       : {
			 aboveZero : function( num ){
				 return num >=0;
			 },
			 belowNum : function( belowNum ){
				 return function( num ){
					 return num < belowNum;
				 }
			 },
			 h : function( num ){
				 return this.aboveZero( num ) && this.belowNum( 360 )(num);
			 },
			 s : function( num ){
				 return this.aboveZero( num ) && this.belowNum( 1 )( num );
			 },
			 l : function( num ){
				 return this.s.call( this, num );
			 },
			 r : function( num ){
				 return this.aboveZero( num ) && this.belowNum( 255 )( num );
			 },
			 g : function( num ){
				 return this.R.call( this, num );
			 },
			 b : function( num ){
				 return this.R.call( this, num );
			 }
		 },
		 bandColorMid     : [
		 	{
		 		position : 0,
			  color    : '#ff0000'
		  },
			{
				 position : 0.125,
				 color    : '#ff7f00'
			 },
			{
				 position : 0.25,
				 color    : '#00ff00'
			},
			{
				 position : 0.375,
				 color    : '#00ff00'
			},
			{
				 position : 0.5,
				 color    : '#00ffff'
			},
			{
				 position : 0.625,
				 color    : '#0000ff'
			 },
			{
				 position : 0.75,
				 color    : '#8B00ff'
			 },
			{
				 position : 0.875,
				 color    : '#FF00FF'
			 },
			{
			 	position  : 1.0,
				color     : '#FF7F7F'
			 }
		 ]
	 };
	 //
	 
	//具体算法参考http://blog.csdn.net/jiangxinyu/article/details/8000999
	colorConvert = {
	 	rgbToHsl : function( data ){
	 	  var r     = data[0]/255,
		      g     = data[1]/255,
		      b     = data[2]/255,
	        max, min,
	        h, s, l;
	 	  
	 	  max = Math.max.call( null, r, g, b );
	 	  min = Math.min.call( null, r, g, b );
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
	 	  
	 	  return [ Math.round(h), s.toFixed(2), l.toFixed(2) ];
	  },
		hslToRgb : function( data ){
		  var h   = data[0] - 0,
			    s   = data[1] - 0,
			    l   = data[2] - 0,
		      r, g, b,
		      p, q, k;
		
		if (s == 0) {
			r = g = b = l;
		}
		else {
			if (l < 0.5) {
				q = l * (1 + s);
			}
			else if (l >= 0.5) {
				q = l + s - (l * s);
			}
			p = 2 * l - q;
			k = h / 360;
			
			r = singleColorCalculation(k + 1 / 3);
			g = singleColorCalculation(k);
			b = singleColorCalculation(k - 1 / 3);
		}
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
	removeEvent  = function( ele, type, handler ){
		 if( ele.removeEventListener ){
			 this.removeEvent = function( ele, type, handler ){
				 ele.removeEventListener( type, handler, false );
			 };
		 }
		 else if( ele.detachEvent ){
			 this.removeEvent = function( ele, type, handler ){
				 ele.detachEvent( type, handler );
			 }
		 }
		 else{
			 this.removeEvent = function( ele, type ){
				 ele[ 'on'+type ] = null;
			 }
		 }
		 this.removeEvent( ele, type, handler );
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
	
	
	//
	changeColorByClick = function( event ){
		var AddOrLess, type, target , addMethod, lessMethod,
			  value, addNum=1;
		event = event || window.event;
		
		addMethod = function( type, num ){
			var isRgb, index;
			configMap.colorCache[ type ] += num;
			isRgb = ('rgb'.indexOf(type) > -1);
			if( isRgb ){
				index = 'rgb'.indexOf( type );
				configMap.colorCache['rgb'][ index ] = configMap.colorCache[ type ];
			}
			else{
				index = 'hsl'.indexOf( type );
				configMap.colorCache['hsl'][ index ] = configMap.colorCache[ type ];
			}
			
			
		};
		
		
		target     = event.target || event.srcElement;
		AddOrLess  = target.className.slice(0, -1);
		type       = target.className.slice(-1).toLowerCase();
		value      = parseInt( target.parentNode.children[1].value );
		if( type==='s' || type==='l' ){
			addNum = 0.01;
		}
		switch( AddOrLess ){
			case "addBtn":
				addMethod( type, addNum );
				break;
			case "lessBtn":
				configMap.infoMap[type]--;
				break;
			default:
				break;
		}
	};
	//
	inputColorInfoChange = function( event ){
		event = event || window.event ;
		
	};
	//绘制色板和色带
	//色带控制360度颜色
	//色板控制亮度0-1.0
	//色板上显示输入的颜色，包括点击获取的颜色
	drawGradient = function( canvas, width, height ){
	   var cnt = canvas.getContext( '2d' ),
		     lightGradient;
	   //渲染亮度
	   lightGradient = cnt.createLinearGradient( 0, 0, 0, height );
	   lightGradient.addColorStop( 0, 'rgba(0, 0, 0, 0)' );
	   lightGradient.addColorStop( 1, 'rgba(0, 0, 0, 1)' );
	   
	   return {
	   	render : function( color ){
	   		var colorGradient;
	   		cnt.clearRect( 0, 0, width, height );
	   		//渲染颜色
		    colorGradient = cnt.createLinearGradient( 0, 0, width, height );
		    
		    colorGradient.addColorStop( 0, 'rgb( 255, 255, 255 )' );
		    colorGradient.addColorStop( 0.5, color );
		    colorGradient.addColorStop( 1, 'rgb( 0,   0,   0   )' );
		    
		    cnt.fillStyle = colorGradient;
		    cnt.fillRect( 0, 0, width, height );
		    
		    cnt.fillStyle = lightGradient;
		    cnt.fillRect( 0, 0, width, height );
	    }
	   };
	   
	   
	 };
	//
	//色带渲染函数
	//
	bandGradient  = function( canvas, width, height ){
    var cnt = canvas.getContext( '2d' ),
	    gradient = cnt.createLinearGradient( 0, 0, width, height );
	 
    configMap.bandColorMid.forEach( function( colorMap ){
      gradient.addColorStop( colorMap.position , colorMap.color );
    } );
	  cnt.clearRect(0, 0, width, height );
	  cnt.fillStyle = gradient;
	  cnt.fillRect( 0, 0, width, height );
	};
	
	//更新显示结果信息
	updateDisInfo = function(){
		var infoEleMap = configMap.infoMap,
			  colorCache = configMap.colorCache;
		
		infoEleMap.colorPanel.style.backgroundColor = 'rgb( ' + colorCache.rgb.join(', ') + ' )';
		infoEleMap.r.value = colorCache.r;
		infoEleMap.g.value = colorCache.g;
		infoEleMap.b.value = colorCache.b;
		
		infoEleMap.h.value = colorCache.h;
		infoEleMap.s.value = colorCache.s;
		infoEleMap.l.value = colorCache.l;
		
		infoEleMap.rgbResult.innerHTML = 'rgb( ' + colorCache.rgb.join(', ') + ' )';
		infoEleMap.hslResult.innerHTML = 'hsl( ' + colorCache.hsl.join(', ') + ' )';
	};
	//设置颜色信息
	setConfigColor = function(){
		var colorCache = configMap.colorCache,
			  color      = configMap.panelCanvas.getColor().data.slice(0, 3),
			  hslValue   = colorConvert.rgbToHsl( color );
		
		colorCache.r = color[0];
		colorCache.g = color[0];
		colorCache.b = color[0];
		colorCache.rgb = color;
		
		colorCache.h = hslValue[0];
		colorCache.s = hslValue[1];
		colorCache.l = hslValue[2];
		colorCache.hsl = hslValue;
		
		updateDisInfo();
	};
	//设置色板的颜色
	setPanelColor = function( bandColor ){
		var colorValue = 'rgb(' + bandColor.join(',') + ')';
		configMap.drawPanel.render( colorValue );
		
		setConfigColor();
	};
  //色板内 点击处理事件
  panelClick = function( event ){
	  var eventCoord, rgbValue,
	      _this = configMap.panelCanvas;
	  event = event || window.event;
	  eventCoord = getEventCoordinate(event);
	  if( _this.pointInPath(eventCoord, _this.limitMap, 5) ){
		  _this.setPointCoord( 'left', eventCoord.x-5 );
		  _this.setPointCoord( 'top',  eventCoord.y-5 );
		  setConfigColor();
	  }
  };
	//色带内 click处理事件
	bandClick = function( event ){
		var eventCoord, bandColor,
			  _this = configMap.bandCanvas;
		event = event || window.event;
		eventCoord = getEventCoordinate( event );
		if ( _this.pointInPath(eventCoord, _this.limitMap) ){
			_this.setPointCoord( 'top',  eventCoord.y-5 );
			bandColor = _this.getColor().data.slice(0, 3);
			setPanelColor( bandColor ); //更新色板颜色值
		}
	};
	
	CanvasFactory = function( dom, point ){
		this.dom      = dom;
		this.context  = this.dom.getContext('2d');
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
				num - this.limitMap[prop] + 'px' ;
		},
		getColor     : function(){
			return this.context.getImageData( getStyle( this.point, 'left' ), getStyle( this.point, 'top' ), 1, 1 );
		}
	};
	
	init  = function(){
		 //项目初始化
		 
		//初始化 项目信息
	 	configMap.bandCanvas  = new CanvasFactory( document.getElementById('band' ), document.getElementById( 'bandPoint'  ) );
	 	configMap.panelCanvas = new CanvasFactory( document.getElementById('panel'), document.getElementById( 'panelPoint' ) );
		
    bandGradient( configMap.bandCanvas.dom, 10, 500 );
    configMap.drawPanel = drawGradient( configMap.panelCanvas.dom, 350, 500 );
    configMap.drawPanel.render( '#ff0000' );
		setConfigColor();
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
	//事件处理函数
	eventHandler    = function() {
	  addEvent( configMap.bandCanvas.dom,      'click',  bandClick  );
	  addEvent( configMap.panelCanvas.dom,     'click',  panelClick );
	  addEvent( configMap.infoMap.disInfoWrap, 'click',  changeColorByClick );
	};
	
	sequenceExecute( init, eventHandler );
	
})( window, document, undefined );
