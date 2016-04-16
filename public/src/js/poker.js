;(function(){
	//生成所有牌，并且记录已出的牌，随机产生剩余的牌
	//num为牌的副数
	var poker=function(num){
		this.num=num;
		this.type=['c','d','h','s'];//方块，梅花，红心，黑桃 'club','diamond','heart','spade'


		this.pokers=[];//所有牌 下标[0,51]
		this.pokerState=[];//使用过的牌的标记，0为未使用 1未已使用
		this.usedPokerNum=0;

		this.init(this.num);
	}
	//生成n副牌 初始化pokers和pokerState
	poker.prototype.init=function(num){
		var temp=num;
			for(var i=0;i<this.type.length;++i){
				for(var j=1;j<=13;++j){
					while(temp>0){
						this.pokers.push(this.type[i]+j);
						this.pokerState.push(0);
						--temp;
					}
					temp=num;
				}
			}
			//console.log(this.pokers);console.log(this.pokerState);
		
	};
	//随机生成一个牌 返回牌 eg:'c1'
	poker.prototype.generateOnePoker=function(){
		var totalnum=this.pokers.length;//当前可用牌的数量

		//生成一张牌，x为下标
		var x=parseInt(Math.floor(Math.random()*totalnum));
		var times=0;//记录随机生成次数，如果随机生成30次还没有找到可出的牌，则按照顺序找
		while(this.pokerState[x]!=0 && times<30){
			x=parseInt(Math.floor(Math.random()*totalnum));
			++times;
		}
		if(this.pokerState[x]!=0){
			for (var i = 0; i < totalnum; i++) 
				if(this.pokerState[i]==0){
					x=i;
					break;
				}
		}

		this.pokerState[x]=1;
		this.usedPokerNum+=1;

		//console.log(this.pokers);console.log(this.pokerState);

		return this.pokers[x];
	};
	//判断当前扑克还能否生成牌 如果都发完了 return false 否则return true
	poker.prototype.canGenerate=function(){
		if(this.usedPokerNum<this.pokers.length){
			return true;
		}
		return false;
	};

	window['poker']=poker;
})();