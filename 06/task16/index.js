/*
*
* */

var musicPlay = (function(){
	var configMap,       songList,         EventUtil,         ClassUtil,
		  createSongList,  displaySongList,  changeSongInfo,    scrollList,
		  getSong,         getProperty,      getElementCoord,   getClickCoord,
		  changeSongList,  eventHandler,     playerControl,      playOrPause,
		  controlProgress, clickControlPlay, clickControlVolume,
		  clickMove,       clickChooseSong,  keyChooseSong,      mouseChooseSong,
		  transformTime,   executeSequence,  init;
	//DOM 元素
	configMap = {
		songListFocus : false,
		//查询框
		searchInput   : document.getElementById( 'search_song'),
		//歌曲播放元素
	  videoEle      : document.getElementById( 'play_video' ),
	  //控制面板
		playControl   : document.getElementById( 'play_control' ),
		//播放列表
		songList      : document.getElementById( 'song_list' ),
		//滚动条
		scrollBar     : document.getElementsByClassName( 'scrollBar' )[0],
		//当前播放的歌曲
		currSong      : 0,
		//正在进行的时间
		songCurrTime  : document.getElementById( 'song_currTime' ),
		timer         : null,
		//歌曲总时间
		songDuration  : 0,
		muted         : document.getElementsByClassName('song_info_volume')[0].getElementsByTagName('img')[0],
		//歌曲名
		songName      : document.getElementById( 'song_name' ),
		songAuth      : document.getElementById( 'song_auth' ),
		songCover     : document.getElementById( 'song_conver' ),
		songEndTime   : document.getElementById( 'song_endTime' ),
		songVolume    : document.getElementById( 'song_volume' ),
		songPlayProgress  : document.getElementById( 'play_progress' )
	};
	//歌曲信息
	songList = [
		{
			name  : 'Introduction',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/001%20Introduction.mp3'
		},
		{
			name  : 'The world this week',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/002%20The%20world%20this%20week.mp3'
		},
		{
			name  : 'Leaders',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/003%20Leaders.mp3'
		},
		{
			name  : 'Leaders - Latin America',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/004%20Leaders%20-%20Latin%20America.mp3'
		},
		{
			name  : 'Leaders - Travel visas',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/005%20Leaders%20-%20Travel%20visas.mp3'
		},
		{
			name  : 'Leaders - Republican tax plans',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/006%20Leaders -%20Republican%20tax%20plans.mp3'
		},
		{
			name  : 'Leaders - Global inflation',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/007%20Leaders%20-%20Global%20inflation.mp3'
		},
		{
			name  : 'Leaders - Internet security',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/008%20Leaders%20-%20Internet%20security.mp3'
		},
		{
			name  : 'Letters',
			auth  : '詹姆士·威尔逊',
			cover : 'img/album.jpg',
			album : 'the economist',
			src   : 'song/009%20Letters.mp3'
		}
	];
	
	
	//公用方法
	//事件方法
	EventUtil = {
		getEvent  : function( event ){
			return event ? event : window.event;
		},
		getTarget : function( event ){
			return event.target || event.srcElement;
		},
		addEvent  : function( ele, type, handler ){
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
		},
		stopPropagation : function( event ){
			if( event.stopPropapation ){
				event.stopPropapation();
			}
			else{
				returnValue = false;
			}
		}
	};
	//class方法
	ClassUtil = {
		add     : function( ele, name ){
			if( ele.classList ){
				this.add = function( ele, name ){
					ele.classList.add( name );
				}
			}
			else{
				this.add = function( ele, name ){
					ele.className += ' '+ name;
				}
			}
			this.add( ele, name );
		},
		remove : function( ele, name ){
		  if( ele.classList ){
		  	this.remove = function( ele, name ){
		  		return ele.classList.remove( name );
			  }
		  }
		  else {
		  	this.remove = function( ele, name ){
		  		var classArr = ele.className.split(' ');
		  		classArr.forEach( function( value, index, arr ){
		  			if( value === name ){
		  				arr.splice( index, 1 );
					  }
				  } );
				  ele.className = classArr.join(' ');
			  }
		  }
		  this.remove( ele, name );
		}
	};
	transformTime = function( num){
		var time = [];
		time.push( parseInt( num/60000 ) ); //minute
		num = num%60000;
		time.push( parseInt( num/1000 ) );//second
		time.forEach( function( value, index, arr ){
			if( value < 1 ){
				arr[ index ] = '00';
			}
			else if( value < 10 ){
				arr[ index ] = '0' + value;
			}
		} );
		return time.join( ':' );
	};
	getProperty = function( ele, property ){
		return document.defaultView.getComputedStyle( ele, null )[ property ];
	};
	//元素在页面中的距离
	getElementCoord = function( ele ){
	  var pageX = parseInt(
	  	            ele.getBoundingClientRect().left
		              + Math.max( document.body.scrollLeft, document.documentElement.scrollLeft)
		            ),
		  
		    pageY = parseInt(
		    	        ele.getBoundingClientRect().top
			            + Math.max( document.body.scrollTop, document.documentElement.scrollTop)
		            );
		
	  return {
	  	x : pageX,
		  y : pageY
	  }
	};
	//鼠标点击位置
	getClickCoord   = function( event ){
		var pageX = event.pageX,
			  pageY = event.pageY;
		
		if( pageX === undefined ){
			pageX = event.clientX
				    + Math.max(document.documentElement.scrollLeft || document.body.scrollLeft );
		}
		if( pageY === undefined ){
			pageY = event.clientY
			      + Math.max(document.documentElement.scrollTop || document.body.scrollTop );
		}
		pageX = parseInt( pageX );
		pageY = parseInt( pageY );
		return {
			x : pageX,
			y : pageY
		}
	};
	
	
	
	
  //获取歌曲列表中li
	getSong     = function( num ){
		return document.getElementsByClassName('songList')[num];
	};
	//生成歌曲
	createSongList = function( songMap ){
		var li = document.createElement('li'),
			content = '<div>' + songMap.name + '</div>'
				+ '<div>' + songMap.auth + '</div>'
				+ '<div>' + songMap.album + '</div>';
		li.className = 'songList';
		li.innerHTML = content;
		return li;
	};
	//生成歌曲播放列表
	displaySongList = function() {
		songList.forEach( function( songMap, index ){
			var li = createSongList( songMap );
			li['data-index'] = index;
			configMap.songList.appendChild(li);
		} );
		changeSongInfo( configMap.currSong );
		//绑定事件
		EventUtil.addEvent( configMap.songList, 'click', clickChooseSong );
	};
	//改变歌曲播放信息
	changeSongInfo = function( num ){
		num = typeof num === 'number' ? num : configMap.currSong + 1;
		if( num > songList.length-1 || num < 0 ) return false;
		var element       = songList[num],
			  lastSong      = getSong( configMap.currSong ),
			  currentSong   = getSong( num );
		//切换选中状态
		(function(){
			ClassUtil.remove( lastSong, 'chosedItem' );
			configMap.currSong = num;
			ClassUtil.add( currentSong, 'chosedItem' );
		}());
		configMap.songListFocus = true;
	  //改变歌曲信息
		configMap.songName.innerHTML    = element.name;
		configMap.songAuth.innerHTML    = element.auth;
		configMap.songCover.src         = element.cover;
		configMap.videoEle.src          = element.src;
		//durationchange可以获取初始信息，ended为结束事件
		EventUtil.addEvent(configMap.videoEle, 'durationchange', function(){
			configMap.songDuration = parseInt( configMap.videoEle.duration*1000 );//保存总时间
			var time = transformTime( configMap.videoEle.duration*1000 );
			configMap.songPlayProgress.getElementsByTagName('span')[0].style.width = '0px';
			configMap.songEndTime.innerHTML = time;//时间格式为00:00
		});
		EventUtil.addEvent(configMap.videoEle, 'ended', function(){
			playOrPause( false ); //结束
			configMap.songCurrTime.innerHTML = configMap.songEndTime.textContent; //结束时时间为终止时间
			configMap.songPlayProgress.getElementsByTagName('span')[0].style.width
				= '400px';
		} );
		return true;
	};
	//滚动播放列表
	scrollList = function( distance ){
		if( distance <= 225 && distance >=0 ){
			configMap.songList.style.top               = -distance + 'px';
			configMap.scrollBar.children[0].style.top  = distance + 'px';
		}
	};
	//播放列表 滚动+选中+改变歌曲播放信息
	changeSongList = function( delta){
		var result;
		delta = delta > 0 ? 1 : -1;
		result = changeSongInfo( configMap.currSong + delta );
		if( result === false ) return false;
		scrollList( 45*delta - parseInt( getProperty(configMap.songList, 'top') ) );
		return true;
	};
	//播放或者暂停
	playOrPause = function( control ){
		var btn = document.getElementById('play_pause');
		if( control === undefined ){
			control = configMap.videoEle.paused;
		}
		if( control ) {
			configMap.timer && clearInterval( configMap.timer );
			btn.className = 'playNow';
			configMap.videoEle.play();
			configMap.timer = setInterval(function(){
				var currTime = configMap.videoEle.currentTime*1000;
			  configMap.songCurrTime.innerHTML = transformTime ( currTime );
			  //当前的时间除以总的时间，然后再乘以总的长度
			  configMap.songPlayProgress.getElementsByTagName('span')[0].style.width
				  = parseInt( currTime/configMap.songDuration* 400 )  + 'px';
			}, 500 );
		}
		else{
			configMap.timer && clearInterval( configMap.timer );
			btn.className = '';
			configMap.videoEle.pause();
		}
	};
	//进度控制
	controlProgress = function( eventOrNum, progressObj, type, num  ){
		var progressBand = progressObj.getElementsByTagName( 'span' )[0];
	  if( typeof eventOrNum !== 'number' ){
			eventOrNum = getClickCoord( eventOrNum ).x - getElementCoord( progressObj ).x;
		}
		eventOrNum  = eventOrNum<10 ? 0 : eventOrNum; //音量特别小时直接设置为零，静音
		progressBand.style.width = eventOrNum + 'px';
		eventOrNum = eventOrNum/num;
	  configMap.videoEle[type] = eventOrNum;
	};

	//事件函数
	playerControl = function( event ){
		var targetId, result;
		event = EventUtil.getEvent( event );
		targetId = EventUtil.getTarget( event ).id;
		switch(targetId){
			case 'pre_song'://上一首
				result = changeSongList(-1); //如果到没有音乐了，则不播放
				playOrPause( result );
				break;
			case 'play_pause':
				playOrPause();
				break;
			case 'next_song'://下一首
				result = changeSongList(1);
				playOrPause( result );
				break;
			default :
				return;
		}
	};
	//点击 移动播放列表 事件权柄
	clickMove  = function( event ){
		var distance, target;
		event    = EventUtil.getEvent(  event );
		target   = EventUtil.getTarget( event );
		distance = getClickCoord( event ).y - getElementCoord( target ).y;
	  scrollList( distance );
	};
	//点击选中切换歌曲 事件权柄
	clickChooseSong = function( event ){
		var index, result;
		event  = EventUtil.getEvent(event);
		index = EventUtil.getTarget(event).parentNode['data-index'];
		if( typeof index !== 'undefined' ){
			result = changeSongInfo( index );
			playOrPause( result );
		}
		EventUtil.stopPropagation( event );
	};
	//上下键选中歌曲 pressdown 事件权柄
	keyChooseSong = function( event ){
		event = EventUtil.getEvent( event );
		var keyCode = event.keyCode;
		if ( configMap.songListFocus ) {
			switch (keyCode) {
				//上键
				case 38 :
					changeSongList( -1 );
					break;
				//下键
				case 40 :
					changeSongList( 1 );
					break;
				default :
					return;
			}
			
		}
	};
	//鼠标滚轮 移动播放列表
	mouseChooseSong = function( event ){
		event = EventUtil.getEvent( event );
		var delta = -event.wheelDelta;
		if( configMap.songListFocus ){
			delta = delta > 0 ? 1 : -1;
			//delta<0 向上滑动
			scrollList( 45*delta - parseInt( getProperty(configMap.songList, 'top') ) );
		}
	};
	//点击控制音量
	clickControlVolume = function( event ){
		var  target, progress, progressBand;
		
		event        = EventUtil.getEvent( event );
		target       = EventUtil.getTarget( event );
		progress     = configMap.songVolume;
		progressBand = progress.getElementsByTagName( 'span' )[0];
		
		if( target === progressBand || target === progress ){
			controlProgress( event, progress, 'volume', 80 );
		}
		return false;
	};
	//点击控制播放进度
	clickControlPlay   = function(){
		var  target, progress, progressBand;
		
		event        = EventUtil.getEvent( event );
		target       = EventUtil.getTarget( event );
		progress     = configMap.songPlayProgress;
		progressBand = progress.getElementsByTagName( 'span' )[0];
		
		if( target === progressBand || target === progress ){
			controlProgress( event, progress, 'currentTime', configMap.songDuration/(1000*400) );
		}
		return false;
	};
	
	
	eventHandler = function(){
		EventUtil.addEvent( configMap.scrollBar, 'click' ,  clickMove );
		EventUtil.addEvent( document,            'keydown', keyChooseSong );
		EventUtil.addEvent( document,            'mousewheel', mouseChooseSong );
    EventUtil.addEvent( configMap.playControl,'click',     playerControl);
		EventUtil.addEvent( document,             'click',     clickControlVolume);
		EventUtil.addEvent( configMap.muted,      'click',     function (){
			          controlProgress(0,configMap.songVolume, 'volume', 80);
		});
		EventUtil.addEvent( document,             'click',     clickControlPlay );
	};
	
	//按顺序执行
	executeSequence = function( ){
  	var args = Array.prototype.slice.call(arguments, 0);
  	args.forEach( function( fn ){
  		fn();
	  } );
  };
	
	init  = function(){
	  executeSequence(displaySongList, eventHandler);
	};
	
	return {
		init     : init,
		songList : songList
	};
})();