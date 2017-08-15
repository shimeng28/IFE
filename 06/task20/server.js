'use strict';
const url      = require( 'url' ),
      exec     = require( 'child_process').exec,
      mongoose = require( 'mongoose' ),
      http     = require( 'http' );


let server = http.createServer( function(request, response){
  let query = url.parse( request.url, true ).query,
      keyWord = query.keyWord || 'iphone',
      device  = query.device  || 'ipad';
 
  console.log( 'start: ...' );
  console.log( 'keyWord: '+ keyWord + ' device: ' + device );
  let command = 'E:\\node\\phantomjs-2.1.1-windows\\phantomjs-2.1.1-windows\\bin\\phantomjs task.js ' + keyWord + ' ' + device;
  exec( command, function(err, stdout, stderr){
    if( err ){
      console.log( 'exec error: ' + err );
    }
    else{
      //连接数据库
      mongoose.connect('mongodb://localhost/local');
      let db = mongoose.connection;
      db.on( 'error', console.error.bind(console, 'connect error') );
      db.once( 'open', function(){
        console.log( 'mongoose connected!' );
      } );

      let schema = new mongoose.Schema( {
        code : Number,
        msg  : String,
        word : String,
        device : String,
        time   : Number,
        dataList : [{
          info  : String,
          link  : String,
          pic   : String,
          title : String
        }]
      } );
      console.log( stdout );
      let Result = mongoose.model( 'Result', schema );

      let result = new Result( JSON.parse(stdout) );

      result.save( function(err, result){
        if( err ){
          console.log( err );
        }
        else{
          console.log( result );
        }
      } );

      response.writeHead( 200, {"Content-Type" : "text/json, charset=utf-8"} );
      console.log( stdout );
      if( stderr ){
        console.log( stderr );
      }
      response.write( stdout );
      response.end();
    }
  } )
} );

server.listen( 8000 );
console.log( 'server is running at http:127.0.0.1:8000' );

