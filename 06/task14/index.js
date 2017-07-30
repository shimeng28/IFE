/**
 * Created by 小时哥 on 2017/7/20.
 */

/*
* easing : linear easeIn easeOut easeInOut
* Animation( test ).animation([ 'left', 'top', 'height' ],
   [
     {
       endProperty : 100, duration : 300, easing : 'linear',
       startFn : function(){},
       endFn: function(){}
     },
     { endProperty : 100, duration : 300, easing : 'linear' },
     { endProperty : 0,   duration : 300, easing : 'easeIn' }
   ]
 );
* */
//数据流动路径 ： animation => start => loop => step => update
// stop : stop( true ) 或者 stop(); 依次为各个属性设置stoped标志位
// continue : 改变stoped标志位的值，并且各个属性依次继续动画
var Animation = ( function(window){
  var getStyle, decideUnit,
      requestAnimationFrame,
      Animation, tween,
      animateDom = [];  //为了在动画暂停后仍能找到暂停的元素

  requestAnimationFrame = window.requestAnimationFrame || ( function(){
    var timelast = 0;
    return window.webkitRequestAnimation || window.mozRequestAnimation ||  function( callback ){
      var timeCurrent = new Date().getTime(),
          timeDelta;
      timeDelta = Math.max( 0, 16 - ( timeCurrent - timelast ) );
      timelast  = timeCurrent + timeDelta;
      return setTimeout( callback( timeCurrent + timeDelta ), timeDelta );
    };
  } )();
  getStyle = function( dom, style ){
    if( dom.currentStyle ){
      return dom.currentStyle[ style ];
    }
    return document.defaultView.getComputedStyle( dom, null )[ style ];
  };
  decideUnit = function( propertyValue ){
    var unit;
      if( ! /(^#\w+)|(^[a-z]+)$/.test(propertyValue) ){
        return unit = propertyValue.match( /([^0-9]+)$/ )[0];
      }
      return unit = '';
  };

  tween = {
    linear: function(t,b,c,d){
      return c*t/d + b;
    },
    easeIn: function(t,b,c,d){
      return c*(t/=d)*t*t + b;
    },
    easeOut: function(t,b,c,d){
      return c*((t=t/d-1)*t*t + 1) + b;
    },
    easeInOut: function(t,b,c,d){
      if ((t/=d/2) < 1)
        return c/2*t*t*t + b;
      return c/2*((t-=2)*t*t + 2) + b;
    }
  }; //缓动算法

  Animation = function( dom ){  //Animation 构造函数
    this.dom            = dom;
    this.propertyList   = null;
    this.configMapList  = null;
  };
  Animation.prototype = {
    constructor : Animation,
    animation   : function( propertyList, configMapList ){
      var that = this;
      if( !propertyList.length  //输入参数不对，抛出错误
          || !configMapList.length
          || propertyList.length !== configMapList.length
      ){
        throw new Error('Lack of animation arguments');
      }
      this.propertyList  = propertyList;
      this.configMapList = configMapList;
      animateDom.push( this ); //将动画的对象压栈
      //循环遍历给定的属性和配置值
      propertyList.forEach(function( propertyName, index ){
        that.start( propertyName, configMapList[ index ] );
      } );
    },
    start       : function( propertyName, configMap ){  //依次开始每一个属性的动画
      var propertyMap,
          easing = tween[configMap.easing] || tween.easeIn;
      this[propertyName + 'config'] = {
        startTime      : 0,
        startProperty  : getStyle( this.dom, propertyName ),
        endProperty    : configMap.endProperty   || 0,
        duration       : configMap.duration || null,
        easing         : easing
      };
      //配置属性动画的参数
      propertyMap = this[propertyName + 'config'];
      propertyMap.propertyUnit = decideUnit( propertyMap.startProperty );
      propertyMap.startProperty = parseInt( propertyMap.startProperty );
      propertyMap.stoped        = false;
      configMap.startFn && configMap.startFn();
      if( configMap.endFn ){
        propertyMap.endFn = configMap.endFn;
      }
      this.loop( propertyName );
    },
    loop       : function( propertyName ){
      var loopExecute,           //循环执行
          that = this;
      loopExecute = function(){
        if( that.step( propertyName ) ){
          requestAnimationFrame( loopExecute );
        }
      };
      loopExecute();
    },
    step       : function( propertyName ){
      var configMap = this[propertyName + 'config'],
          pos;
      if( configMap && configMap.stoped === true ){ //如果设置为停止，则停止动画
        return false;
      }
      if( configMap.startTime > configMap.duration ){//时间到停止动画
        this.update( configMap.endProperty );
        configMap.endFn && configMap.endFn();
        return false;
      }
      pos = configMap.easing( configMap.startTime, configMap.startProperty, configMap.endProperty-configMap.startProperty, configMap.duration );
      this[propertyName+'config'].startTime++;
      this.update( propertyName, pos, configMap.propertyUnit );
      return true;
    },
    update     : function( propertyName, pos, unit ){ //设置属性值
      this.dom.style[ propertyName ] = pos + unit;
    },
    stop       : function( stoped ){  //停止动画
      var that   = this;

      stoped = (stoped !== undefined) ? stoped : true;
      this.propertyList.forEach( function( property ){
        var configMap = that[property + 'config'];
        configMap.stoped = stoped;
      } );
    },
    continue   : function(){
      var that = this;
      if( !this[ this.propertyList[0]+'config' ].stoped ){
        return;  //如果动画没有停止，返回
      }
      this.stop.call( this, false ); //设置动画停止标志位为false
        //依次重新继续开启动画效果
      this.propertyList.forEach( function( property ){
        that.loop( property );
      } );
    }
  };
  Animation.prototype.slideUp = function( configMap ){
    var dom = this.dom,
        config = {
          endProperty : configMap.endProperty || 0,
          duration    : configMap.duration || 200,
          easing      : configMap.easing ||  'linear'
        };
    if( this.heightconfig ){
      throw new Error('你已经在进行slideUp动画了');
    }
    this.propertyList.push( 'height' );
    this.configMapList.push( config );
    this.start( 'height', config );
  };
  return function(dom){
    for( var i=0; i<animateDom.length; i++ ){  //如果元素已经开启动画了，则直接在原来的动画上继续操作
      if( animateDom[i].dom === dom )
        return animateDom[i];
    }
    return new Animation( dom );
  };
} )( window );
