;(function(){
	//person有各种功能:下注，拿牌，买保险，停牌，....
	var person=function(){
		// this.role=i;//庄家或者玩家
		// this.node=node;

		this.totalMoney=0;//本次游戏总金额，为负数表示亏了
		this.refresh();

		
		// this.initBoard();
	};
	
	//新的一局，某些参数归0
	person.prototype.refresh=function(){
		if(this.role==='wj'){
			this.betMoney=0;//存的number 而非string
			this.insurance=false;//未买保险
		}
		
		this.pokers=[];//牌 pokers[0]为暗牌
		this.points=0;//当前总点数 A表示为1的时候的总点数
		this.pointsContain1=0;//其中一个A表示为11时的总点数。因为两个A都表示为11就爆了，因此不用考虑
		this.state=-1;//-1表示未开始游戏，-2表示该用户点击开始，0表示BlackJac，1表示爆了
		
		this.TwoContains1=0;//前两张牌里是否由A，（！庄家特有属性，如果写成继承可以提出来）
	};
	
	//加一张牌 c1 方块1
	person.prototype.addPoker=function(i){
		this.pokers.push(i);
		//计算点数
		var curnum= +i.substring(1,i.length);
		curnum= (curnum>10) ? 10:curnum;//转换 JQK
		this.points+=curnum;
		//如果是第一个1 则给pointsContain1赋值。
		if(curnum===1 && this.pointsContain1===0){
			this.pointsContain1=this.points+10;
			//如果前两个里面有1，玩家可以选择买保险
			if(this.role==='zj' && this.pokers.length<=2){
				this.TwoContains1=1;
			}
		}
		else if(this.pointsContain1!=0){
			this.pointsContain1+=curnum;
		}


		//此时可以选择双倍下注，判断是否为BlackJac
		if(this.pokers.length==2){
			if(this.pointsContain1===21){
				this.state=0;
			}
		}
		//爆了 改变状态
		if(this.points>21){
			this.state=1;
		}

		//显示扑克
		showCard(this.node,i);
	};
	//在pokersArea中显示当前所有牌
	// person.prototype.showPokers=function(){
	// 	var temp="";

	// 	this.node.querySelector(".allPokers").innerHTML+= '<img src="/img/'+i+'.jpg" alt="" />';;
	// };
	//在pointArea中显示得分
	person.prototype.showPoint=function(){
		this.pointArea.innerHTML=this.state+" "+this.getPoints();
	};
	//获取当前点数 
	person.prototype.getPoints=function(){
		if(this.points>21){//爆了
			return this.points;
		}
		else if(this.pointsContain1>21){
			return this.points;
		}
		else if(this.pointsContain1>this.points){
			return this.pointsContain1;
		}
		else return this.points;
	};
	//游戏结束 更改资金 
	person.prototype.resetMoney=function(i){
		this.totalMoney += i;
	};
	//按钮禁用
	person.prototype.disableBtn=function(btn){
		btn.disabled=true;
	};
	//按钮启用
	person.prototype.reuseBtn=function(btn){
		btn.disabled=false;
	};
	window["personObj"]=person;
})();