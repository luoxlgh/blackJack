//房间对象，存储当前房间页面，玩家数,扑克（每个房间的扑克应该互不影响）等
var pkModule = require("./poker");
var roomObj=function(i,j){
	this.playerNum=i; //最多玩家个数
	this.pokerNum=j;
	this.curP=[];
	
	
	this.sockets={};//存放不同玩家的socket 不要存放为数组，因为座位中间可能没有选择
	this.arrhtml=[];
	this.html="";//当前界面
	this.init();

	this.refresh();
}
//每局过后将某些变量重新赋值
roomObj.prototype.refresh=function(){
	
	this.points={};//记录每个玩家的分数
	this.darkCard={};//记录每个玩家的暗牌
	this.state={};//记录每个玩家的状态 0表示BlackJac，1表示爆了 其他则对比大小
	this.betMoney={};
	this.startGame=false;

	this.curStartP=[];//存的div序号
	this.curStopP=[];
	this.initPoker(this.pokerNum);
};
//初始化房间扑克数
roomObj.prototype.initPoker=function(i){
	this.poker=new pkModule.poker(i);
};
//判断该链接是否已加入房间 1为庄家，2为玩家 0为没有进入游戏的连接
roomObj.prototype.hasSocket=function(socket){
	for(var i in this.sockets){
		if(this.sockets[i]===socket){
			return (+i===0)? 1: 2;
		}
	}
	return 0;
};
roomObj.prototype.leavePlayer=function(socket){
	for(var i in this.sockets){
		if(this.sockets[i]===socket){
			break;
		}
	}
	//如果庄家离开 则所有玩家也没法玩了
	if(this.sockets[i]===socket){
		delete this.sockets[i];
		delete this.points[i];
		delete this.darkCard[i];
		delete this.state[i];
		delete this.betMoney[i];
		// console.log("i:"+i);
		// console.log(this.curStartP+";"+this.removeFromArr(this.curStartP,i));
		// console.log(this.curStopP+";"+this.removeFromArr(this.curStopP,i));
		// console.log(this.curP+";"+this.removeFromArr(this.curP,i));
		removeFromArr(this.curStartP,i);
		removeFromArr(this.curStopP,i);
		removeFromArr(this.curP,i);
		console.log("~~"+this.curStartP.length+","+this.curStopP.length+","+this.curP.length);
		socket.broadcast.emit('user left', i);
	}

};
 var removeFromArr=function(arr,i){
	for(var j=0;j<arr.length;++j){
		//要转换成数字再恒等，不然容易出错，有的存的字符串 有的是数字
		if(+arr[j]=== +i){
			break;
		}
	}
	if(j<arr.length){
		arr.splice(j,1);
	}
	//console.log("removeFromArr:"+arr);
	//return arr;
};
//加入玩家 2表示游戏开始，咱不能加入 3表示房间满
roomObj.prototype.canAddPlayer=function(){
	if(this.curP.length<this.playerNum){
		if(this.startGame===false){
		
			return 1;//房间没满 还能加入
		}
		if(this.startGame===true){
			return 2;
		}
	}
	return 3;
};
function ArrContains(arr, e){
	for(var i=0;i<arr.length;++i){
		if(arr[i]===e)
			return true;
	}
	return false;
}
roomObj.prototype.addPlayer=function(socket,id){
	if(ArrContains(this.curP,id)===false){
		this.curP.push(id);
		this.sockets[id]=socket;
	}
};
roomObj.prototype.addStartedPlayer=function(i){
	if(ArrContains(this.curStartP,i)===false){
		this.curStartP.push(i);
	}
};
//根据玩家初始化页面
roomObj.prototype.init=function(){
	var arr=[];
	arr.push(`<div id="container2" class="angled-135 stripes">
	<div id="header2">
		<h1 id="gameName">BlackJack</h1>
	</div>
	<div id="pls">
		<div id="zj">
			<h1 class="type">庄家</h1>
			<div class="allPokers">
			</div>
			<div class="point">
				<div class="pstate"></div>
				<div class="totalMoney">总金额：<span>0</span></div>
			</div>
		</div>`);
	for(var i=2;i<=this.playerNum;++i){
		arr.push(`<div class="wj empty">
			<h1 class="type">玩家</h1>
			<div class="allPokers">
			</div>
			<div class="point">
				<div class="pstate"></div>
				<div class="totalMoney">总金额：<span>0</span></div>
			</div>
		</div>`);
	}
	arr.push(`</div>
	<div id="footer">
		<h1 id="copyRight">copyRight@luoxl</h1>
	</div>
</div>`);
	this.arrhtml=arr;
	this.html=arr.join("");
};
//初始发牌 第一张牌是暗拍，其他都是明牌 data表示发几张牌，第一次是发两张
roomObj.prototype.dealCard=function(data){
	//var Cards="";
	for(var i in this.sockets){
		this.dealCardToOne(data,i);
	}
};
//给client发data张牌 data只能为1或者2
roomObj.prototype.dealCardToOne=function(data,client){
	var openDeal=this.poker.generateOnePoker();
	var res=(data===2)?this.poker.generateOnePoker()+","+ openDeal : openDeal;
	this.sockets[client].emit("add card",res);
	// for(var j in this.sockets){
	// 	if(client!=j){//其他人只发第二张牌，第一张是暗牌
	// 		this.sockets[j].emit("other's card",client,openDeal,data);
	// 	}
	// }
	this.sockets[client].broadcast.emit("other's card",client,openDeal,data);
};
//编号为data的player停止拿牌
//roomObj.prototype.stopCard=function(data,darkCard,points){
roomObj.prototype.stopCard=function(data){
	//this.curStopNum+=1;
	this.curStopP.push(data["num"]);
	this.darkCard[data["num"]]=data["darkCard"];
	this.points[data["num"]]=data["point"];
	this.state[data["num"]]=data["state"];
	if(data["betMoney"]){
		this.betMoney[data["num"]]=data["betMoney"];
	}
	this.sockets[data["num"]].broadcast.emit('player stop card',data["num"]);
	//游戏结束 显示所有玩家的分数 算钱
	if(this.curStopP.length===this.curStartP.length){
		for(var i in this.sockets){
			this.sockets[i].broadcast.emit("other's card",i,this.darkCard[i],-1);
		}
		//算每个玩家的分
		this.calculateMoney();
	}
};
//算分。如果庄家玩家都爆，庄家赢一倍；都没爆，庄家大，赢一倍；如果庄家黑杰克，玩家普通，庄家赢两倍。
//点一样或者都是黑杰克，平手
roomObj.prototype.calculateMoney=function(){
	var zjmoney=0;
	//var zjstate=this.state[0];
	var temp;
	for(var i in this.sockets){
		if(i!=0){
			if(this.state[0]===0){//庄家黑杰克的情况
				if(this.state[i]===0){//平手
					//this.sockets[i].emit("game result",0);
					temp=0;
				}
				else {//玩家i输两倍
					temp=-2*this.betMoney[i];
					//this.sockets[i].emit("game result",-temp);
					//zjmoney+= -temp;
				}
			}
			else if(this.state[0]===1){//庄家爆了
				if(this.state[i]===0){//玩家赢两倍
					temp=2*this.betMoney[i];
					//this.sockets[i].emit("game result",temp);
					//zjmoney+= -temp;
				}
				else if(this.state[i]===1){//玩家输一倍
					temp=-this.betMoney[i];
					//this.sockets[i].emit("game result",-temp);
					//zjmoney+= -temp;
				}
				else {//玩家赢一倍
					temp=this.betMoney[i];
					//this.sockets[i].emit("game result",temp);
					//zjmoney+= -temp;
				}
			}
			else{//庄家正常点数情况下
				if(this.state[i]===0){//玩家赢两倍
					temp=2*this.betMoney[i];
					//this.sockets[i].emit("game result",temp);
					//zjmoney+= -temp;
				}
				else if(this.state[i]===1){//玩家输一倍
					temp=-this.betMoney[i];
					//this.sockets[i].emit("game result",-temp);
					//zjmoney+= -temp;
				}
				else {
					if(this.points[0]<this.points[i]){//玩家赢一倍
						temp=this.betMoney[i];
						//this.sockets[i].emit("game result",temp);
						//zjmoney+= -temp;
					}
					else if(this.points[0]>this.points[i]){//玩家输一倍
						temp= -this.betMoney[i];
						//this.sockets[i].emit("game result",-temp);
						//zjmoney+= -temp;
					}
					else {//平手
						//this.sockets[i].emit("game result",0);
						temp=0;
					}
				}
				
			}
			this.sockets[i].emit("game result",temp);
			zjmoney-= temp;
			this.sockets[i].broadcast.emit("other's game result", i, temp);
		}
	}
	this.sockets[0].emit("game result",zjmoney);
	this.sockets[0].broadcast.emit("other's game result", 0, zjmoney);
	// room信息刷新，准备下一轮
	this.refresh();
}

exports.roomObj=roomObj;