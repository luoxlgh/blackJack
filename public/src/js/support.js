;
//-----------------------dom操作
function hasClass(node, cls) {  
    return node.className.match(new RegExp('(\\s|^)' + cls + '(\\s|$)'));  
}  
var removeClass=function(node,cls){
	// if (hasClass(node, cls)) {
        var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)');
        if(node.className!=undefined){
        	if(node.className.match(cls)!=null)
        		node.className = node.className.replace(reg, ' ');
        }
        
    // }
};
function addClass(node, cls) {  
    if (!this.hasClass(node, cls)) node.className +=( " " + cls);  
}  
function setClass(node,cls){
	node.className = cls;
}

//---------------函数
//在节点下show名字为i的card
function showCard(node,i){
	node.querySelector(".allPokers").innerHTML+= '<img src="/img/'+i+'.jpg" alt="" />';
}
function setPointArea(node,data){
	if(data>0){
      node.querySelector(".pstate").innerHTML=("<span class='winTag'>本局进账："+data+"</span>");
    }
    else if(data<0){
      node.querySelector(".pstate").innerHTML=("<span class='loseTag'>本局输了："+(-data)+"</span>");
    }
    else {
      node.querySelector(".pstate").innerHTML=("<span class='pingTag'>本局平局</span>");
    }
}
//node的总金额变为改变i
function showTotalMoney(node,i){
	var curMoneyNode= node.querySelector(".totalMoney").querySelector("span");
	curMoneyNode.innerHTML= +curMoneyNode.innerHTML+i;
}