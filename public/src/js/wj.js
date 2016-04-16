;(function(person){
	//var socket = io();
	var wjObject=function(node,i,socket){
		//person.call(this);
		this.role='wj';
		this.node=node;
		this.num=i;//记录玩家所在位置(选择了哪个div块)
		this.socket=socket;
		
		//this.initBoard();
	};
	wjObject.prototype=new person();
	wjObject.prototype.bet=function(i){
		this.betMoney=i;
	};

	//默认保险为betMoney的一般
	wjObject.prototype.buyInsurance=function(){
		this.insurance=true;
	};
	wjObject.prototype.boardRefresh=function(){
		console.log("boardRefresh");
		this.pokersArea.innerHTML="";
		this.pstateArea.innerHTML="";
		//this.betBtn.options[0].selected = true;  game result的时候再重置

		this.reuseBtn(this.addBtn);
		this.reuseBtn(this.stopBtn);
		this.disableBtn(this.startBtn);
		this.disableBtn(this.betBtn);
	};
	//在node元素下，生成各种按钮 庄家无下注
	wjObject.prototype.initBoard=function(){
		//var div=document.createElement("div");
		var wjelems=[`<div class="type">
				<button >开始</button>
				<button >加牌</button>
				<button >停牌</button>
				<select class="betMoney">
					<option value="0">赌注</option>
					<option value="20">20</option>
					<option value="30">30</option>
					<option value="40">40</option>
					<option value="50">50</option>
					<option value="60">60</option>
			    </select>
			</div>
		    <div class="allPokers">
		    </div>
			<div class="point">
				<div class="pstate"></div>
				<div class="totalMoney">总金额：<span>0</span></div>
			</div>`
			];
		
		
			this.node.innerHTML=wjelems.join("");
			addClass(this.node, "cur");
			var btns=this.node.getElementsByTagName("button");
			this.startBtn=btns[0];
			this.addBtn=btns[1];
			this.stopBtn=btns[2];
			console.log(btns);
			this.pokersArea=this.node.querySelector(".allPokers");
			this.pstateArea=this.node.querySelector(".pstate");
			//this.pointArea=this.node.getElementsByTagName("div")[2];
			this.betBtn=this.node.querySelector(".betMoney");

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
				"state":_this.state,
				"betMoney":_this.betMoney
			};
			_this.socket.emit('stop card',res);

			_this.disableBtn(_this.addBtn);
			_this.disableBtn(_this.stopBtn);
			_this.reuseBtn(_this.betBtn);
			_this.betBtn.options[0].selected = true;
		
		};
		this.startBtn.onclick=function(){
			console.log("start");
			if(_this.state===-1){
				var betMoney=+ _this.betBtn.value;
				if(betMoney===0){
					alert("还未下注！");
				}
				else{
					//重置该人的值
					_this.refresh();//值重置
   	 				_this.boardRefresh();

					_this.bet(betMoney);
					//readyPlayer+=1;//开始游戏的玩家数加一
					//return true;
					_this.socket.emit('person started',_this.num);
					addClass(_this.node,"started");
					_this.started=-2;
				}
			}
		}
		
	};

	
	
	window["wjObject"]=wjObject;
})(personObj);

// 传进来的参数不要同名，不然会出各种找不到该变量的错误 (person)(personObj)