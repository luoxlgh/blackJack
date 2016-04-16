window.onload=function(){
  var socket = io();//当前页面的socket
  var page=document.querySelector("body");//页面，在此进行页面修改
  var wjDiv;
  var allDiv;
  var totalPlayer=0;
  var pagehtml=[];//页面数组
  var person;

  //只有第一个人有这个界面，这是庄家界面
  
  
  //新连接 根据不同顺序显示不同网页
  socket.on("new connection",function(data){
    if(data===1){//连进来的是庄家（第一个人默认庄家）
      page.innerHTML=`<div id="header">
    <h1>Welcome to BlackJack Game</h1>
  </div>
  <div id="container">
    <div id="creatingPic">
      <div id="pers" class="rot"></div>
      <div id="pers2" class="rot"></div>
      <div id="pers3" class="rot"></div>
    </div>
    <div id="creatingSelection">
      <div class="sel">
        <span class="tips">选择玩家个数：</span>
            <select id="num">
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="5">5</option>
              <option value="6">6</option>
            </select>
      </div>
      <div class="sel">
        <span class="tips">选择扑克牌副数：</span>
            <select id="pokernum">
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4</option>
              <option value="4">5</option>
            </select>
      </div>
          
          <button id="submit">确认创建房间</button>
    </div>
  </div>
  <div id="footer">
    <a href="http://baike.so.com/doc/5329886-5565060.html" target="_blank">查看游戏规则</a>
  </div>`;
      var submitBtn=document.querySelector("#submit");
        submitBtn.onclick=function(){
          totalPlayer=+document.querySelector("#num").value;//存储玩家个数
          var pokernum=+document.querySelector("#pokernum").value;//存储扑克牌数
          //向路由发送总人数
          socket.emit('room setting',totalPlayer,pokernum);

          //修改界面 初始化
          //page.innerHTML="";
          //p=new poker(1);
         // readyPlayer=0;//已经点击开始的player个数。开始游戏的玩家数等于totalPlayer个数才开始
          
        };
    }
    // else的情况放到wj connection里了
    // else {
    //   var wj=new wjObject(page);
    // }
  });
  //新庄家
  socket.on("new zj",function(data){
    // pagehtml=data;
    page.innerHTML=data;
    var zjArea=page.querySelector("#zj");
    person=new zjObject(zjArea,socket);
    person.initBoard();
  });
  //人满了返回加入失败
  socket.on("room full",function(data){
    page.innerHTML='房间人已满，无法加入';
  });
  socket.on("wait for another round",function(data){
    page.innerHTML='游戏已经开始，暂无法加入';
  });
  
  //接收到玩家连接的消息
  socket.on("wj connection",function(data){
    // pagehtml=data;
    //initialBorad=data;
    page.innerHTML=data;
    page.querySelector("#zj").onclick=function(){
      alert("此位置已经被占了");
    };
    wjDiv=page.querySelectorAll(".wj");
    for(var i=0;i<wjDiv.length;++i){
      wjDiv[i].num=i+1;//玩家下标从1开始 0为庄家
      wjDiv[i].onclick=function(){
        //console.log("num:"+this.num+",this:"+this);
        if(hasClass(this, "empty")){
          socket.emit('wj added',this.num);
          person=new wjObject(this,this.num,socket);
          person.initBoard();
          //this.className="wj";
          removeClass(this,'empty');
          //一个玩家只能选择一个位置，其他位置要设置onclick null
          page.querySelectorAll("#zj").onclick=null;
          for(var i=0;i<wjDiv.length;++i){
            wjDiv[i].onclick=null;
          }
        }
        else {
          alert("此位置已经被占了");
        }
      }
    }
    
  });
  //新玩家加入，更改界面显示
  socket.on("new wj",function(data){
    if(wjDiv===undefined){
      wjDiv=page.querySelectorAll(".wj");
    }
    removeClass(wjDiv[data-1],'empty');
    
  });
  //新玩家点击开始加入，更改界面显示
  socket.on("new person started",function(data){
    if(allDiv===undefined){
      allDiv=[];
      Array.prototype.push.apply(allDiv,page.querySelectorAll("#zj"));
       Array.prototype.push.apply(allDiv,wjDiv);
      //allDiv=[].concat(...,...wjDiv);
    }
    console.log(data+";"+allDiv)
    addClass(allDiv[data],'started');
    allDiv[data].querySelector(".pstate").innerHTML="<small class='tag'>开始游戏</small>"
    //将该元素所在块清空显示
    //allDiv[data].innerHTML=(data===0)?"庄家":"玩家";
    allDiv[data].querySelector(".allPokers").innerHTML="";
  });
  //玩家收到开始游戏消息
  socket.on("game start",function(data){
    alert("游戏开始");
    //把pstate small改成不要闪烁的，看晕了
    var pstates=page.querySelectorAll("small");
    for(var i in pstates){
      removeClass(pstates[i],"tag");
    }
    
  });
  //玩家收到自己的牌
  socket.on("add card",function(data){
    var card=data.split(",");
    card.forEach(function(e){
      person.addPoker(e);
    });
    
  });
  //其他玩家收到牌，本玩家可以看到除了暗牌以外的所有牌 data为2表示首牌，为1表示普通牌，为-1表示暗牌
  socket.on("other's card",function(i,card,data){
    if(data===2){
      showCard(allDiv[i],"cardback");
      showCard(allDiv[i],card);
      //如果是庄家的首牌，且是1，则让玩家选择是否买保险
      if(i===0 && i.substring(1,i.length)==='1'){
        var insureMoney=confirm("Are You Going to Buy Insurance(half of your betMoney)?");
        if (insureMoney!=null && insureMoney!=""){
          person.buyInsurance();
        }
      }
    }
    else if(data===1){
      showCard(allDiv[i],card);
    }
    //将cardback翻正
    else if(data===-1){
      allDiv[i].querySelectorAll("img")[0].src="/img/"+card+".jpg";
    }
  });
  //其他玩家停牌
  socket.on("player stop card",function(data){
    allDiv[data].querySelector(".pstate").innerHTML="<small class='stopTag'>已停牌</small>";
    removeClass(allDiv[data],'started');
  });

  //得到金额
  socket.on("game result",function(data){
    setPointArea(person.node,data);
    showTotalMoney(person.node,data);

    person.resetMoney(data);
    person.reuseBtn(person.startBtn);
    
  });
  //其他玩家金额
  socket.on("other's game result",function(i, data){
    setPointArea(allDiv[i],data);
    showTotalMoney(allDiv[i],data);
  });

  socket.on("user left",function(data){
    allDiv[data].querySelector(".pstate").innerHTML="";
    allDiv[data].querySelector(".allPokers").innerHTML="";
    allDiv[data].querySelector(".totalMoney").innerHTML="总金额：<span>0</span>";
    setClass(allDiv[data],'wj empty');
  });

  socket.on("zj quit",function(data){
    page.innerHTML="庄家跑了~！请重新加入房间"
  });
  
  // function refreshOtherBoard(){
  //   if(person.num!=0)
  //     allDiv[0].innerHTML="庄家";
  //   for(var i=1;i<allDiv.length;++i){
  //     if(i!=person.num)
  //       allDiv[i].innerHTML="玩家";
  //   }
  // }
  
};