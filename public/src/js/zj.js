;(function(person){
	
	var zjObject=function(node,socket){
		this.role='zj';
		this.node=node;
		this.socket=socket;
		this.num=0;//默认是房间第一人
		// this.initBoard();
	};
	zjObject.prototype =new person();

	zjObject.prototype.boardRefresh=function(){
		console.log("boardRefresh");
		this.pokersArea.innerHTML="";
		this.pstateArea.innerHTML="";

		this.reuseBtn(this.addBtn);
		this.reuseBtn(this.stopBtn);
		this.disableBtn(this.startBtn);
	};
	// <button disabled="false">开始</button>
	// 			<button disabled="false">加牌</button>
	// 			<button disabled="false">停牌</button>
	//在node元素下，生成各种按钮 庄家无下注
	zjObject.prototype.initBoard=function(){
		
		var zjelems=[`<div class="type">
				<button >开始</button>
				<button >加牌</button>
				<button >停牌</button>
			</div>
		    <div class="allPokers">
		    </div>
			<div class="point">
				<div class="pstate"></div>
				<div class="totalMoney">总金额：<span>0</span></div>
			</div>`];

			this.node.innerHTML=zjelems.join("");
			addClass(this.node, "cur");

			btns=this.node.getElementsByTagName("button");
			this.startBtn=btns[0];
			this.addBtn=btns[1];
			this.stopBtn=btns[2];
			console.log(btns);
			this.pokersArea=this.node.querySelector(".allPokers");
			this.pstateArea=this.node.querySelector(".pstate");
		

		var _this=this;
		this.addBtn.onclick=function(){
			console.log("add");
			_this.socket.emit('request card',_this.num);
		};
		this.stopBtn.onclick=function(){
			console.log("stop");
			var res={
				"num":_this.num,
				"darkCard":_this.pokers[0],
				"point":_this.getPoints(),
				"state":_this.state
			};
			_this.socket.emit('stop card',res);

			_this.disableBtn(_this.addBtn);
			_this.disableBtn(_this.stopBtn);
		};
		this.startBtn.onclick=function(){
			console.log("start");
			if(_this.state===-1){
				_this.refresh();//值重置
   	 			_this.boardRefresh();

				_this.socket.emit('person started',_this.num);
				//_this.node.style["border-color"]="red";
				addClass(_this.node,"started");
				_this.state===-2;
			}
		}
	};
	window["zjObject"]=zjObject;
})(personObj);