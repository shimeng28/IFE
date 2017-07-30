var colorPicker = (function( window, document ){
	 var configMap, initCanvas,
	     init
	 ;
	 
	 configMap = {
	 	 panelCanvas : document.getElementById( 'panel' ),
		 bandCanvas  : document.getElementById( 'band' )
		 
	 };
	 
	 initCanvas = function( canvas ){
	   var cnt = canvas.getContext( '2d' );
	 };
	 
	 init  = function(){
		 initCanvas( configMap.panelCanvas );
		 initCanvas( configMap.bandCanvas );
	 };
	 return {
	 	init : init
	 }
})(window, document, undefined);
