let largetCanvas = ( function(){
	let config,         EventUtil,   getImgUrl,            loadImage,
		  createChoseBox, dragHandler, sequenExec,           borderDetect,
		  getStyle,       openDrag,    createHideCanvas,     drawImageToCanvas,
		  Chain,          inPath,      createChoseBoxChain,  dragHandlerChain,
		  createHideCanvasChain,    drawImageToCanvasChain,  drawImagePixel,
		   getClientCoord, getEleClientCoord, clickHandler, init;
	//dom管理器
	config    = {
		uploadBtn    : document.getElementById( 'uploadBtn' ),
		imgContainer : document.getElementById( 'imgContainer' ),
		uploadImg    : document.getElementById( 'imgContainer' ).getElementsByTagName('img')[0],
		canvas       : document.getElementById( 'canvas' ).getElementsByTagName( 'canvas' )[0],
		choseBox     : null,
		hideCanvas   : null,
	};
	//Utility function
	EventUtil = {
		addEvent( ele, type, handler ){
			if( window.addEventListener ){
				this.addEvent = (ele, type, handler) => ele.addEventListener(type, handler, false);
			}
			else if( window.attachEvent ){
				this.addEvent = (ele, type, handler) => ele.attachEvent( 'on'+type, handler );
			}
			else{
				this.addEvent = (ele, type, handler) => ele['on' + type] = handler;
			}
			
			this.addEvent( ele, type, handler );
		},
		removeEvent( ele, type, handler ){
			if( window.removeEventListener ){
				this.removeEvent = ( ele, type, handler )=>{
					ele.removeEventListener( type, handler );
				}
			}
			else if( window.detachEvent ){
				this.removeEvent = (ele, type, handler ) => {
					ele.detachEvent( 'on' + type, handler );
				}
			}
			else{
				this.removeEvent = (ele, type ) => {
					ele['on' + type] = null;
				}
			}
			this.removeEvent( ele, type, handler );
		}
	};

	//get style of element
	getStyle     = function( ele, prop ){
		if( ele.currentStyle ){
			getStyle = ( ele, prop ) => { return parseInt( ele.currentStyle[prop] ); };
		}
		else{
			getStyle = ( ele, prop ) => { return parseInt( document.defaultView.getComputedStyle(ele, null)[prop] ); };
		}
		return getStyle( ele, prop );
	};
	//get the url of upload picture
	getImgUrl    = (function( window ) {
		if ( window.URL ) {
			return  ( file ) => window.URL.createObjectURL( file );
		} else if ( window.webkitURL ) {
			return  ( file ) => window.webkitURL.createObjectURL( file );
		}
		else {
			return null;
		}
	})( window );
	//border detect
	borderDetect = function( {max, min, value}=map ){
		if( value < min ){
			value = min;
		}
		else if( value > max ){
			value = max;
		}
		return value;
	};
	getClientCoord = function(event){
		let clientX = event.clientX,
		    clientY = event.clientY;
		return {
			x : clientX,
			y : clientY
		}
	};
	getEleClientCoord = function( ele ){
		let clientRect = ele.getBoundingClientRect();
		let { left, right, bottom, top } = clientRect;
		bottom -= 50;
		right  -= 50;
		return {
			left,
			right,
			bottom,
			top
		};
	};
	inPath = function( coord, range ){
		let { x: coordX, y: coordY } = coord;
		let { left, right, bottom, top } = range;
		return	( coordX <= right && coordX >= left && coordY >= top && coordY <= bottom );
	};
	
	Chain  = function( fn ){
		this.fn = fn;
		this.fn.next = null;
	};
	Chain.prototype.setNextStep = function( nextStep, ...args ){
		//若有参数，第一个参数应为this的值，之后为参数
		this.fn.next = nextStep.bind( ...args );
	};
	Chain.prototype.next        = function(){
		this.fn.nextStep();
	};
	
	
	// upload image
	loadImage        = function( event=window.event ){
		let target = event.target;
		if( target.id==='uploadBtn' ){
			let file = target.files[0];
			
			if( file ){
				config.uploadImg.src = getImgUrl(file);
			}
			else{
				config.uploadImg.alt = '上传图片失败'
			}
		}
	};
	//创建选择框
	createChoseBox = function(){
		if( config.choseBox ) return;
		let box = document.createElement( 'div' );
		box.className = 'draggable';
		document.getElementById( 'imgContainer' ).appendChild( box );
		config.choseBox = box;
		arguments.callee.next && arguments.callee.next();
		return 'done';
	};
	//拖拽
	dragHandler    = (function(){
		let originTop  = null;
		let originLeft = null;
		let dragging   = null;
		let clickFlag  = false;
	  function drag(event=window.event){
			let target = event.target || event.srcElement;
			switch( event.type ){
				case 'mousedown':
					clickFlag = true;
					if( target.className.indexOf('draggable') > -1 ){
						dragging   = target;
						originLeft = event.clientX - target.offsetLeft;
						originTop  = event.clientY - target.offsetTop;
					}
				break;
				case 'mousemove':
					if( dragging !== null ) {
						clickFlag = false;
						EventUtil.removeEvent( document, 'click',   clickHandler );
						let x = event.clientX - originLeft;
						let y = event.clientY - originTop;
						//边界检查
						x = borderDetect( {max : getStyle(config.imgContainer, 'width' ) - getStyle(config.choseBox, 'width' ),
							min:0, value : x } );
						y = borderDetect( {max : getStyle(config.imgContainer, 'height') - getStyle(config.choseBox, 'height'),
							min:0, value : y } );
						dragging.style.left = x + 'px';
						dragging.style.top  = y  + 'px';
					}
				break;
				case 'mouseup':
					if( clickFlag ){
						EventUtil.addEvent( document, 'click',   clickHandler );
					}
					else{
						dragging = null;
						dragHandler.next && dragHandler.next();
					}
					
				break;
			}
	  }
	
	  return {
	  	enable(){
			  EventUtil.addEvent( document, 'mousemove', drag );
			  EventUtil.addEvent( document, 'mouseup',   drag );
			  EventUtil.addEvent( document, 'mousedown', drag );
			  dragHandler.next && dragHandler.next();
		  },
		  disable(){
			  EventUtil.removeEvent( document, 'mousemove', drag );
			  EventUtil.removeEvent( document, 'mouseup',   drag );
			  EventUtil.removeEvent( document, 'mousedown',   drag );
		  }
	  };
	})();
	//拖拽生效
	openDrag       = function(){
		dragHandler.enable();
	};
	//创建一个隐藏的canvas，用于接受图片信息
	createHideCanvas = function(){
		let canvas = document.createElement( 'canvas' );
		canvas.width  = getStyle( config.choseBox, 'width'  );
		canvas.height = getStyle( config.choseBox, 'height' );
		
		config.hideCanvas = canvas;
		arguments.callee.next && arguments.callee.next();
	};
	//将图片信息给隐藏的canvas
	drawImageToCanvas = function(){
		let { hideCanvas, uploadImg:image, choseBox } = config;
		let cnt     = hideCanvas.getContext( '2d' ),
			boxRect = choseBox.getBoundingClientRect(),
			sy      = getStyle( choseBox, 'top'  ),
			sx      = getStyle( choseBox, 'left' ),
			swidth  = boxRect.width,
			sheight = boxRect.height;
		cnt.clearRect( 0, 0, swidth, sheight );
		cnt.drawImage( image, sx, sy, swidth, sheight, 0, 0, swidth, sheight );
		arguments.callee.next && arguments.callee.next();
	};
	//图片像素放大10倍
	//putImageData()七位参数的不能放大
	drawImagePixel = function(){
		let { hideCanvas, canvas, uploadImg:img } = config;
		let hideCnt = hideCanvas.getContext( '2d' );
		let imageData = hideCnt.getImageData( 0, 0, getStyle( img, 'width'  ), getStyle( img, 'height' ) );
		let ctx = canvas.getContext( '2d' );
		
		ctx.clearRect( 0, 0, 500, 500 );
		
		let width = imageData.width;
		let height= imageData.height;
		let data  = imageData.data;
		let pos   = 0;
		for( let i=0; i<width; i++ ){
			for( let j=0; j<height; j++ ){
				pos = i*width + j;
				ctx.fillStyle = 'rgba('+ data[pos*4] + ',' + data[pos*4+1] + ',' + data[pos*4+2] + ',' + data[pos*4+3]/255 +')';
				let x = j*10;
				let y = i*10;
				ctx.fillRect( x, y, 10, 10 );
			}
		}
	};
	clickHandler = function( event ){
		let clientCoord = getClientCoord(event),
			  ele         = config.imgContainer,
			  choseBox    = config.choseBox,
		    eleCoord    = getEleClientCoord( ele );
		if( inPath( clientCoord, eleCoord ) ){
			choseBox.style.left = clientCoord.x - eleCoord.left + 'px';
			choseBox.style.top  = clientCoord.y - eleCoord.top  + 'px';
			createHideCanvas();
		}
	};
	
	//执行链
	createChoseBoxChain   = new Chain( createChoseBox   );
	dragHandlerChain         = new Chain( dragHandler      );
	createHideCanvasChain = new Chain( createHideCanvas );
	drawImageToCanvasChain= new Chain( drawImageToCanvas);
	
	createChoseBoxChain.setNextStep(    openDrag            );
	dragHandlerChain.setNextStep(       createHideCanvas    );
	createHideCanvasChain.setNextStep(  drawImageToCanvas   );
	drawImageToCanvasChain.setNextStep( drawImagePixel      );
	
	
	//init
	init = function(){
		EventUtil.addEvent( config.uploadBtn, 'change', loadImage );
		createChoseBox();
		EventUtil.addEvent( document, 'click',   clickHandler );
	};
	return {
		init
	};
} )();
