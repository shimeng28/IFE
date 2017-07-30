var fileManager = (function(){
	var configMap, EventUtil, ClassUtil,
	    operateDir, expandDir, collapseDir,
	    eventHandler, init;
	configMap = {
		openDirClassName : 'openDir',
		container : document.getElementsByClassName( 'treeContainer' )[0]
	};
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
		remove   : function( ele, name ){
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
		},
		contains : function( ele, name ){
			if( ele.classList ){
				this.contains = function( ele, name ){
					return ele.classList.contains( name );
				}
			}
			else{
				this.contains = function(){
					var classArr = ele.className.split(' ');
					classArr.forEach( function( value, index, arr ){
						if( value === name ){
							return true;
						}
					} );
					return false;
				};
				
			}
		}
	};
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
	
	collapseDir = function( dir ){
		dir.firstElementChild.style.display = 'none';
	};
	expandDir   = function( dir ){
	  dir.firstElementChild.style.display = 'block';
	};
	operateDir = function( dir ){
		if( ClassUtil.contains(dir, configMap.openDirClassName) ){
			ClassUtil.remove( dir, configMap.openDirClassName );
			collapseDir( dir );
		}
		else{
			ClassUtil.add( dir, configMap.openDirClassName );
			expandDir( dir );
		}
	};
	
	eventHandler = function( event ){
		var target;
		event = EventUtil.getEvent( event );
		target = EventUtil.getTarget( event );
		if( ClassUtil.contains( target, 'dir' ) ){
			operateDir( target );
		}
		EventUtil.stopPropagation( event );
	};
	
	
	
	
	init = function () {
		EventUtil.addEvent( configMap.container, 'click', eventHandler );
	};
  return init();
})();