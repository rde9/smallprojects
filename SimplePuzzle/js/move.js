//处理拼图运动
function getStyle(obj,attr) {
    return obj.currentStyle ? obj.currentStyle[attr]:getComputedStyle(obj,false)[attr];
}

function startMove(obj, json, fun) {
    clearInterval(obj.timer);
    obj.timer = setInterval(function() {
        var isStop = true;
        for(var attr in json) {
            var iCur = 0;
            // 判断运动的是不是透明度值
            if(attr == "opacity") {
                iCur = parseInt(parseFloat(getStyle(obj,attr)) * 100);
            } else {
                iCur = parseInt(getStyle(obj,attr));
            }
            var iSpeed = (json[attr] - iCur) / 8;
            //运动速度大于0则向下取整， 小于0则向上取整
            iSpeed = iSpeed > 0 ? Math.ceil(iSpeed) : Math.floor(iSpeed);
            //判断所有运动是否全部完成
            if(iCur != json[attr]) {
                isStop = false;
            }
            //运动开始
            if(attr == "opacity") {
                obj.style.filter = "alpha:(opacity:" + (json[attr] + iSpeed) + ")";
                obj.style.opacity = (json[attr] + iSpeed) / 100;
            } else {
                obj.style[attr] = iCur + iSpeed + "px";
            }
        }
        //判断是否全部完成
        if(isStop) {
            clearInterval(obj.timer);
            if(fun) {
                fun();
            }
        }
    },30);
}