var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var port = process.env.PORT || 3000;

server.listen(port, function () {
  console.log('Server listening at port %d', port);
});

// 静态目录
app.use(express.static(__dirname + '/public'));

//------------------对象引入
// var wjModule = require("./wj");
// var zjModule = require("./zj");
var roomModule = require("./room");
//new wjModule.person();

// 游戏事件

var playerNum = 0;//总数
//var curPNum=0;//当前连接数
var room;

io.on('connection', function (socket) {
  var addedPayer = false;//是否已有玩家 变量好像没什么用
  //curPNum+=1;
  //console.log(curPNum);
  //创建room 加入庄家
  if(room===undefined){
    socket.emit("new connection",1);
  }
  else if(room.curP.length>=1){
    if(room.canAddPlayer()===1){
      socket.emit("wj connection",room.html);
    }
    else if(room.canAddPlayer()===3){
      socket.emit("room full");//房间人数到达上限
    }
    else socket.emit("wait for another round");
  }

  // 得到总人数的信息（由庄家创建）
  socket.on('room setting', function (data1,data2) {
    //防止多个人同时创建房间
    if(room===undefined){
      room=new roomModule.roomObj(data1,data2);
      if(room.canAddPlayer()===1){
        room.addPlayer(socket,0);
        socket.emit("new zj",room.html);
      }
    }
    else socket.emit("wj connection",room.html);
  });
  //玩家选择位子，加入该房间 data为class为wj的序号 从1开始
  socket.on('wj added', function (data) {
    if(room.startGame===false){
      room.addPlayer(socket,data);
      room.arrhtml[data]=`<div class="wj">
      <h1 class="type">玩家</h1>
      <div class="allPokers">
      </div>
      <div class="point">
        <div class="pstate"></div>
        <div class="totalMoney">总金额：<span>0</span></div>
      </div>
    </div>`;
      room.html=room.arrhtml.join("");

      //广播是哪个位置被占领了，改变页面
      socket.broadcast.emit('new wj', data);
    }
  });

  //player点击开始，data=0为庄家，data=1为第一个玩家
  socket.on("person started",function(data){
    room.addStartedPlayer(data);
    //广播是哪个位置被占领了，改变页面
    socket.broadcast.emit('new person started', data);
    if(data===0){
      room.arrhtml[data]='<div id="zj" class="started">玩家</div>';
    }
    else {
      room.arrhtml[data]='<div class="wj started">玩家</div>';
    }
    
    room.html=room.arrhtml.join("");
    console.log(room.curStartP.length+","+room.curP.length);
    if(room.curStartP.length===room.curP.length){
      room.startGame=true;//标记房间开始游戏
      socket.broadcast.emit('game start');
      socket.emit('game start');//也要给自己发
      //分别给每个玩家生成两个牌
      room.dealCard(2);
    }
  });

  //收到player的拿牌请求
  socket.on('request card', function (data) {
    room.dealCardToOne(1,data);
  });
  //收到player的停牌请求
  //socket.on('stop card', function (data,darkCard,points) {
  socket.on('stop card', function (data) {
    room.stopCard(data);
  });
  
  // 玩家离开
  socket.on('disconnect', function () {
    if (room!=undefined) {
      var temp=room.hasSocket(socket);
      if(temp===2){//如果是已经加入房间的玩家
        room.leavePlayer(socket);
      }
      //游戏解散
      else if(temp===1){
        room=undefined;
        socket.broadcast.emit('zj quit');
      }
    }
    //room.curPN-=1;
  });
});
