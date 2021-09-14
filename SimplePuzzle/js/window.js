//主方法
window.onload = function() {
    var dropEl = document.getElementById("droptarget"),
        ulEl = document.getElementById("ul1");
    aLi = [],
        disX = 0,
        disY = 0,
        minZindex = 1,
        stepCount = 0,
        aPos = [],
        isEnd = false,
        nodePos = [];
    
    //检测sessionStorage是否存在图片
    if(sessionStorage.getItem('nodePos') == null) {
        function handleEvent(event) {
            var reader = new FileReader();
            var files,len;

            //阻止默认行为
            EventUtil.preventDefault(event);
            sessionStorage.clear();

            // 选中拖拽区域
            if(event.type == "dragenter" || event.type == "dragover") {
                dropEl.classList.add("droptarget-highlight");
            }
            if (event.type == "dragleave" || event.type == "drop") {
                dropEl.classList.remove("droptarget-highlight");
            }

            //拖放事件处理
            if(event.type == "drop") {
                files = event.dataTransfer.files;
                len = files.length;
                //文件合法检验
                if(!/image/.test(files[0].type)) {
                    alert('请上传图片类型的文件');
                }
                else if(len > 1) {
                    alert('上传图片数量不能大于1');
                }

                //创建画布
                var canvas = document.createElement('canvas');
                var context = canvas.getContext('2d');
                var img = new Image(),
                    thumbimg = new Image();

                //读取图片
                reader.readAsDataURL(files[0]);
                reader.onload = function(e) {
                    img.src = e.target.result;
                }
                
                //判断方向
                function isLandscape(width, height) {
                    return width > height;
                }

                //图片对象加载完毕后进行等比缩放
                //若为纵向，限制最大宽度500px
                //若为横向，限制最大高度500px
                img.onload = function() {
                    var targetWidth, targetHeight;
                    if(isLandscape(this.width,this.height)) {
                        targetHeight = this.height > 500 ? 500 : this.height;
                        targetWidth = targetHeight / this.height * this.width;
                    } else {
                        targetWidth = this.width > 500 ? 500 : this.width;
                        targetHeight = targetWidth / this.width * this.height;
                    }
                    canvas.width = targetWidth;
                    canvas.height = targetHeight;
                    context.drawImage(img, 0, 0, targetWidth,targetHeight);
                    //保存缩略图到sessionStorage
                    var tmpSrc = canvas.toDataURL("image/jpeg");
                    sessionStorage.setItem('FullImage',tmpSrc);
                    thumbimg.src = tmpSrc;
                }
                
                // 切分图片
                thumbimg.onload = function() {
                    var sliceWidth, sliceHeight, sliceBase64;
                    var sliceWidthCount, sliceHeightCount;
                    var ulFill = ''; // ul标签内填充内容 (li)
                    var n = 0; // 计数
                    var slices = [];
                    if(isLandscape(this.width, this.height)) {
                        sliceWidthCount = 4;
                        sliceHeightCount = 3;
                    }
                    else {
                        sliceWidthCount = 3;
                        sliceHeightCount = 4;
                    }

                    sliceWidth = this.width / sliceWidthCount;
                    sliceHeight = this.height / sliceHeightCount;
                    
                    canvas.width = sliceWidth;
                    canvas.height = sliceHeight;

                    for(var j = 0; j < sliceHeightCount; j++) {
                        for(var i = 0; i < sliceWidthCount; i++) {
                            context.drawImage(thumbimg,sliceWidth * i, sliceHeight *j, sliceWidth, sliceHeight, 0, 0 ,sliceWidth, sliceHeight);
                            // 保存切片到sessionStorage
                            sliceBase64 = canvas.toDataURL("image/jpeg");
                            sessionStorage.setItem('slice' + n, sliceBase64);
                            // 添加 display:block; 防止三像素问题
                            newElement = "<li name=\"" + n + "\" style=\"margin:2px;\"><img src=\"" + sliceBase64 + "\" style=\"display:block;\"></li>";
                            //随机打乱图片顺序
                            (Math.random() > 0.5) ? slices.push(newElement) : slices.unshift(newElement);
                            n++;
                        }
                    }
                     
                    for(var k = 0; k < n; k++) {
                        ulFill += slices[k];
                    }

                    sessionStorage.setItem('imageWidth', this.width + 18);
                    sessionStorage.setItem('imageHeight', this.height + 18);
                    //略微增加宽高
                    ulEl.style.width = this.width + 18 + 'px';
                    ulEl.style.height = this.height + 18 + 'px';
                    ulEl.innerHTML = ulFill;
                    gameInit();

                    //移除拖放元素
                    dropEl.remove();
                }
            }
        }

        //即 element.addEventListener(type, handler, false);
        EventUtil.addHandler(dropEl,"dragenter",handleEvent);
        EventUtil.addHandler(dropEl,"dragleave",handleEvent);
        EventUtil.addHandler(dropEl,"dragover", handleEvent);
        EventUtil.addHandler(dropEl,"drop",handleEvent);
    } else {
        ulEl.innerHTML = '';
        //获取切片顺序
        slicePos = sessionStorage.getItem('nodePos').split(",");
        var ulFill = '';
        for (var i = 0, len = slicePos.length; i < len; i++) {
            sliceContent = sessionStorage.getItem('slice' + slicePos[i]);
            ulFill += "<li name=\"" + slicePos[i] + "\" style=\"margin:2px;\"><img src=\"" + sliceContent + "\" style=\"display:block;\"></li>";
        }
        ulEl.style.width = sessionStorage.getItem('imageWidth') + 'px';
        ulEl.style.height = sessionStorage.getItem('imageHeight') + 'px';
        ulEl.innerHTML = ulFill;
        gameInit();

        dropEl.remove();
    }

    function gameInit() {
        // 获取已有步数
        var localStepCount = sessionStorage.getItem('stepCount');
        if(localStepCount != null) {
            stepCount = parseInt(localStepCount);
        }
        countEl = document.getElementById('cnt');
        countEl.innerText = "count: " + stepCount;

        //获取切片列表
        aLi = ulEl.getElementsByTagName("li");
        for(var i = 0; i < aLi.length; i++) {
            var t = aLi[i].offsetTop;
            var l = aLi[i].offsetLeft;
            aLi[i].style.top = t + "px";
            aLi[i].style.left = l + "px";
            aPos[i] = {left: l, top: t};
            aLi[i].index = i;
            //记录切片顺序
            nodePos.push(aLi[i].getAttribute('name'));
            sessionStorage.setItem('nodePos', nodePos);
        }
        for(var i = 0; i < aLi.length; i++) {
            aLi[i].style.position = "absolute";
            aLi[i].style.margin = 0;
            //绑定拖拽事件
            setDrag(aLi[i]);
        }
    }

    //拖拽
    function setDrag(obj) {
        obj.onmouseover = function () {
            obj.style.cursor = "move";
            console.log(obj.index);
        }

        obj.onmousedown = function (event) {
            console.log('onmousedown')
            var scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
            var scrollLeft = document.documentElement.scrollLeft || document.body.scrollLeft;
            obj.style.zIndex = minZindex++;
            //当鼠标按下时计算鼠标与拖拽对象的距离
            disX = event.clientX + scrollLeft - obj.offsetLeft;
            disY = event.clientY + scrollTop - obj.offsetTop;
            document.onmousemove = function (event) {
                //当鼠标拖动时计算div的位置
                var l = event.clientX - disX + scrollLeft;
                var t = event.clientY - disY + scrollTop;
                obj.style.left = l + "px";
                obj.style.top = t + "px";

                for (var i = 0; i < aLi.length; i++) {
                    aLi[i].className = "";
                }
                var oNear = findMin(obj);
                if (oNear) {
                    oNear.className = "active";
                }
            }

            document.onmouseup = function () {
                document.onmousemove = null;       //当鼠标弹起时移出移动事件
                document.onmouseup = null;         //移出up事件，清空内存
                //检测是否碰上
                var oNear = findMin(obj);
                if (oNear) {
                    //交换位置
                    oNear.className = "";
                    oNear.style.zIndex = minZindex++;
                    obj.style.zIndex = minZindex++;

                    startMove(oNear, aPos[obj.index]);
                    startMove(obj, aPos[oNear.index], function () {
                        gameIsEnd();
                    });

                    //交换index
                    var t = oNear.index;
                    oNear.index = obj.index;
                    obj.index = t;

                    //步数加1
                    stepCount++;
                    countEl.innerHTML = "count: " + stepCount;

                    //交换本次存储中的位置信息
                    var tmp = nodePos[oNear.index];
                    nodePos[oNear.index] = nodePos[obj.index];
                    nodePos[obj.index] = tmp;
                    sessionStorage.setItem('nodePos', nodePos);
                    sessionStorage.setItem('stepCount', stepCount);
                } else {
                    startMove(obj, aPos[obj.index]);
                }
            }
            clearInterval(obj.timer);

            return false;//低版本出现禁止符号
        }
    }

    //碰撞检测
    function colTest(obj1, obj2) {
        var t1 = obj1.offsetTop;
        var r1 = obj1.offsetWidth + obj1.offsetLeft;
        var b1 = obj1.offsetHeight + obj1.offsetTop;
        var l1 = obj1.offsetLeft;

        var t2 = obj2.offsetTop;
        var r2 = obj2.offsetWidth + obj2.offsetLeft;
        var b2 = obj2.offsetHeight + obj2.offsetTop;
        var l2 = obj2.offsetLeft;

        if (t1 > b2 || r1 < l2 || b1 < t2 || l1 > r2) {
            return false;
        } else {
            return true;
        }
    }

    //勾股定理求距离(左上角的距离)
    function getDis(obj1, obj2) {
        var a = obj1.offsetLeft - obj2.offsetLeft;
        var b = obj1.offsetTop - obj2.offsetTop;
        return Math.sqrt(Math.pow(a, 2) + Math.pow(b, 2));
    }

    //找到距离最近的
    function findMin(obj) {
        var minDis = 999999999;
        var minIndex = -1;
        for (var i = 0; i < aLi.length; i++) {
            if (obj == aLi[i]) continue;
            if (colTest(obj, aLi[i])) {
                var dis = getDis(obj, aLi[i]);
                if (dis < minDis) {
                    minDis = dis;
                    minIndex = i;
                }
            }
        }
        if (minIndex == -1) {
            return null;
        } else {
            return aLi[minIndex];
        }
    }


    //判断游戏是否结束
    function gameIsEnd() {
        for (var i = 0, len = aLi.length; i < len; i++) {
            if (aLi[i].getAttribute('name') != aLi[i].index) {
                return false;
            }
        }

        var finImage = new Image();
        finImage.src = sessionStorage.getItem('FullImage');
        ulEl.innerHTML = "";
        ulEl.append(finImage);
        sessionStorage.clear();
    }
};