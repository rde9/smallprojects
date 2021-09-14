const display1El = document.querySelector('.display-1');
const display2El = document.querySelector('.display-2');
const tempResultEl = document.querySelector('.temp-result');
const numbersEl = document.querySelectorAll('.number');
const operationEl = document.querySelectorAll('.operation');
const parenthesesEl = document.querySelectorAll('.parentheses');
const backEl = document.querySelector('.backspace');
const equalEl = document.querySelector('.equal');
const clearAllEl = document.querySelector('.all-clear');
const clearLastEl= document.querySelector('.last-entity-clear');

let dis1Num = '';
let dis2Num = '';
let result = null;
let lastOperation = '';
let haveDot = false;
let operationPressed = false;
let leftParPressed = false;
let rightParPressed = false;
let initialState = true;
let justEqualled = false;
let waitingParentheses = 0; // 有几层括号等待

numbersEl.forEach(number => {
   number.addEventListener('click',(e) => {   
        if(justEqualled) clearVar();
        if(e.target.innerText === '.' && !haveDot) {
        // 前面什么都没有时输入'.'要补0   
        if(dis2Num === '') {
                dis2Num += '0';
                display2El.innerText = dis2Num;
           }
           haveDot = true;
       } else if (e.target.innerText === '.' && haveDot) {
           return;
       }
       dis2Num += e.target.innerText;
       display2El.innerText = dis2Num;
       initialState = false;
       leftParPressed = false;
       rightParPressed = false;
       operationPressed = false;
   });
});

parenthesesEl.forEach(par => {
    par.addEventListener('click',(e) => {
        if(justEqualled) clearVar();
        haveDot = false;
        const parName = e.target.innerText;
        if(parName === '(') {
            if(rightParPressed) return; // )( 不合法
            leftParPressed = true;
            dis1Num += parName + ' ';
            waitingParentheses++; // 增加一层括号等待
        }
        if(parName === ')') {
            rightParPressed = true;
            if(operationPressed) return; // 2 + ) 不合法
            if(!waitingParentheses) return; // 1234) 不合法
            dis1Num += dis2Num + ' ' + parName + ' ';
            waitingParentheses--; // 减少一层括号等待
            valid = expValidate(dis1Num);
            if (valid) {
                result = mathOperation(dis1Num); // 即时计算结果
                tempResultEl.innerText = result;
            }
        }
        display1El.innerText = dis1Num;
        dis2Num = '';
        display2El.innerText = '0';
    })
})

operationEl.forEach(operation => {
    operation.addEventListener('click', (e) => {
        //if(!dis2Num) return;
        //if(initialState) return;
        //if(justEqualled)
        if(leftParPressed) return;
        haveDot = false;
        const operationName = e.target.innerText;
        if(rightParPressed) { // 此时无需计算操作，直接把符号加入表达式
            dis1Num += operationName + ' '; // 添加本次的符号
            display1El.innerText = dis1Num;
            // 也无需处理 dis2Num, 括号部分已经处理过
            rightParPressed = false;
            operationPressed = true;
            return;
        }
        if(dis2Num === '') {
            dis2Num += '0';
            display2El.innerText = dis2Num;
        }
        if(operationPressed) {
            dis1Num = dis1Num.substring(0,dis1Num.length - 2);
        } else {
            dis1Num += dis2Num + ' ';
            // 计算符号前的内容
            valid = expValidate(dis1Num);
            if(valid)
                result = mathOperation(dis1Num);
        }
            //dis1Num += dis2Num + operationName;
        /*
        dis1Num += dis2Num + ' ' + name + ' ';
        display1El.innerText = dis1Num;
        display2El.innerText = '';
        dis2Num = '';
        tempResultEl.innerText = result;
        */
        /*
        if(dis1Num && dis2Num && lastOperation) {
            mathOperation();
        } else {
            result = parseFloat(dis2Num);
        }
        clearVar(operationName);
        lastOperation = operationName;
        */
        if(valid)
            tempResultEl.innerText = result;
        dis1Num += operationName + ' '; // 添加本次的符号
        display1El.innerText = dis1Num;
        dis2Num = ''; // 清空dis2Num
        display2El.innerText = '0';
        leftParPressed = false;
        rightParPressed = false;
        operationPressed = true;
        justEqualled = false;
    })
});

function clearVar(name = '') {
    dis1Num = '';
    dis2Num = '';
    display1El.innerText = dis1Num;
    display2El.innerText = dis2Num;
    tempResultEl.innerText = '0';
    justEqualled = false;
}

function expCompress(expression = '') {
    console.log(expression);
    return expression.replace(/\s/g,'');
}

function expValidate(expression = '') {
    if(waitingParentheses) return false;
    return true;
}
function mathOperation(expression = '') {
    // 压缩空格
    expression = expCompress(expression);
    // 括号补全
    for(i = 0; i < waitingParentheses; i++)
        expression += ')';
    // 清除空内容括号 ()
    expression.replace(/\(\)/g,'');
    // 计算
    return eval(expression);
    /*
    if(lastOperation === '*')
        result = parseFloat(result) * parseFloat(dis2Num);
    else if(lastOperation === '+')
        result = parseFloat(result) + parseFloat(dis2Num);
    else if(lastOperation === '-')
        result = parseFloat(result) - parseFloat(dis2Num);
    else if(lastOperation === '/')
        result = parseFloat(result) / parseFloat(dis2Num);
    else if(lastOperation === '%')
        result = parseFloat(result) % parseFloat(dis2Num);
    */
}

backEl.addEventListener('click',(e) => {
    if(operationPressed || leftParPressed || rightParPressed) return;
    if(dis2Num === '') return;
    dis2Num = dis2Num.substring(0,dis2Num.length - 1);
    display2El.innerText = dis2Num;
})

equalEl.addEventListener('click', (e) => {
    if(!dis1Num || !dis2Num) return;
    haveDot = false;
    dis1Num += dis2Num;
    display1El.innerText = dis1Num;
    result = mathOperation(dis1Num);
    dis2Num = result;
    display2El.innerText = result;
    tempResultEl.innerText = '';
    dis1Num = ''; // 留备下次操作为operation时用
    leftParPressed = false;
    rightParPressed = false;
    justEqualled = true;
})

clearAllEl.addEventListener('click', (e) => {
    initialState = true;
    leftParPressed = false;
    rightParPressed = false;
    operationPressed = false;
    display1El.innerText = '0';
    display2El.innerText = '0';
    dis1Num = '';
    dis2Num = '';
    result = '';
    tempResultEl.innerText = '0';
})

clearLastEl.addEventListener('click', (e) => {
    display2El.innerText = '0';
    dis2Num = '';
})

window.addEventListener('keydown', (e) => {
    if(
        e.key === '0' ||
        e.key === '1' ||
        e.key === '2' ||
        e.key === '3' ||
        e.key === '4' ||
        e.key === '5' ||
        e.key === '6' ||
        e.key === '7' ||
        e.key === '8' ||
        e.key === '9' ||
        e.key === '.'
    ) // 数字 button
        clickButtonEl(e.key);
    else if(
        e.key === '+' ||
        e.key === '-' ||
        e.key === '*' ||
        e.key === '/' ||
        e.key === '%'
    ) // 运算符 operation
        clickOperation(e.key);
    else if(
        e.key === 'Enter' ||
        e.key === '='
    ) // 等于号 equal
        clickEqual(e.key);
    else if(
        e.key === 'Escape'
    ) // 清空 clear
        clickClear(e.key);
    else if(
        e.key === '(' ||
        e.key === ')'
    ) // 括号 parentheses
        clickPar(e.key);
    else if(
        e.key === 'Backspace'
    ) // 退格 back
        clickBack(e.key);
});

function clickButtonEl(key) {
    numbersEl.forEach(button => {
        if(button.innerText === key){
            button.click();
        }
    })
}

function clickOperation(key) {
    operationEl.forEach(button => {
        if(button.innerText === key){
            button.click();
        }
    })
}

function clickEqual(key) {
    equalEl.click();
}

function clickClear(key) {
    clearAllEl.click();
}

function clickPar(key) {
    parenthesesEl.forEach(par => {
        if(par.innerText === key) {
            par.click();
        }
    })
}

function clickBack(key) {
    backEl.click();
}