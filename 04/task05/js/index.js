let infiniteScroll = {
    init(){
    	this.content = document.getElementById( 'content' );
    	this.loading = false;

    	this.loadImg = null;
    	this.createLoadingImg();
      this.scrollHandler = this.scrollHandler.bind(this);
    	this.content.addEventListener( 'scroll', this.scrollHandler, false );
    },
    addItem(){ //return a div
    	let div = document.createElement( 'div' );
      let img = new Image();
      img.src = './img/icon.jfif';
      div.appendChild(img);

      let h3 = document.createElement( 'h3' );
      h3.innerHTML = '一条消息';

      div.appendChild( h3 );
      return div;
    },
    createLoadingImg(){ //return loadImg div
    	let loadImg = document.createElement( 'div' );
    	loadImg.className = 'loadImg';
      let img = document.createElement( 'img' );
      img.src="./img/load.png";
      loadImg.appendChild( img );
      this.loadImg = loadImg;
    },
    loadItem(count=5){
      let content = this.content;
      content.appendChild( this.loadImg );     
      let fragment = document.createDocumentFragment();
      for( let i=0; i<count; i++ ){
      	fragment.appendChild( this.addItem() );
      }
      setTimeout( function(fragment){
      	this.content.removeChild( this.loadImg );
      	this.content.appendChild( fragment ); 
      }.bind(this, fragment), 1500 ); 
    },
    scrollHandler(){
    	content = this.content;
    	//节点的视口高度 + 滚动高度 》= 节点的总高度 说明到底部了
      if( content.offsetHeight + content.scrollTop >= content.scrollHeight ){
      	this.loadItem();	
      }      
    }
};