const Koa     = require('koa'),
	    phantom = require( 'phantom' ),
	    parse   = require( 'co-busboy' ),
	    https   = require( 'https' ),
	    path    = require( 'path' ),
	    fs      = require( 'fs' ),
	    crypto  = require( 'crypto' ),
	    app     = new Koa();

app.use( function* (next){
	if( this.path === '/favicon.ico' ) return;
	
	if( this.request.path !== '/search' && this.request.method !== 'POST' ) return yield next;
	
	let parts = parse( this );
	
	let part, key,
		  phInstance = null,
		  page       = null;
	
	while( part = yield parts ){
		if( part.length ){
			key = part[1];
		}
	}
	
	var phInstance = yield phantom.create();
	page.seeting('userAgent', 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1');
	
} );