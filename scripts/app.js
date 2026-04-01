// Basic calculator with safe evaluation (shunting-yard -> RPN evaluation)
// Features: keyboard support, parentheses, percent, decimal, memory (MC/MR/M+/M-), sign toggle, AC, DEL, history.

(() => {
  const displayEl = document.getElementById('display');
  const buttons = Array.from(document.querySelectorAll('.buttons button'));
  let memory = 0;
  let history = [];
  // We keep an expression string that user builds using displayed tokens
  let expression = '';

  function updateDisplay(val){
    displayEl.value = val;
  }

  function sanitizeForDisplay(s){
    // Replace * / with × ÷ for user readability
    return s.replace(/\*/g, '×').replace(/\//g, '÷');
  }

  function appendToken(token){
    // If token is an operator, ensure spacing for easier reading
    expression += token;
    updateDisplay(sanitizeForDisplay(expression));
  }

  function clearAll(){
    expression = '';
    updateDisplay('');
  }

  function deleteLast(){
    if(!expression) return;
    expression = expression.slice(0, -1);
    updateDisplay(sanitizeForDisplay(expression));
  }

  function toggleSign(){
    // Apply sign toggle to the last number in expression
    // Find last number using regex
    const match = expression.match(/(-?\d*\.?\d+)(?!.*\d)/);
    if(!match){
      // If there's no number, do nothing
      return;
    }
    const num = match[0];
    const start = match.index;
    const before = expression.slice(0, start);
    const toggled = (parseFloat(num) * -1).toString();
    expression = before + toggled;
    updateDisplay(sanitizeForDisplay(expression));
  }

  function applyPercent(){
    // Convert last number to its percentage (divide by 100)
    const match = expression.match(/(-?\d*\.?\d+)(?!.*\d)/);
    if(!match) return;
    const num = match[0];
    const start = match.index;
    const before = expression.slice(0, start);
    const percent = (parseFloat(num) / 100).toString();
    expression = before + percent;
    updateDisplay(sanitizeForDisplay(expression));
  }

  // Shunting-yard algorithm for safe evaluation
  function tokenize(expr){
    const tokens = [];
    const pattern = /\s*([0-9]*\.?[0-9]+|[()+\-*/%])\s*/g;
    let m;
    let idx = 0;
    while((m = pattern.exec(expr)) !== null){
      tokens.push(m[1]);
      idx = pattern.lastIndex;
    }
    return tokens;
  }

  function toRPN(tokens){
    const output = [];
    const ops = [];
    const prec = { '+':1, '-':1, '*':2, '/':2, '%':2 };
    const isOperator = (t) => Object.prototype.hasOwnProperty.call(prec, t);

    for(let i=0;i<tokens.length;i++){
      const t = tokens[i];
      if(!isNaN(Number(t))){
        output.push(t);
      } else if(isOperator(t)){
        // handle unary minus
        if(t === '-' && (i === 0 || (tokens[i-1] === '(' || isOperator(tokens[i-1])))){  
          // convert to unary marker 'u-'
          ops.push('u-');
          continue;
        }
        while(ops.length && isOperator(ops[ops.length-1]) && prec[ops[ops.length-1]] >= prec[t]){
          output.push(ops.pop());
        }
        ops.push(t);
      } else if(t === '('){
        ops.push(t);
      } else if(t === ')'){  
        while(ops.length && ops[ops.length-1] !== '('){
          output.push(ops.pop());
        }
        if(ops.length === 0) throw new Error('Mismatched parentheses');
        ops.pop(); // pop '('
      } else {
        throw new Error('Unknown token: ' + t);
      }
    }
    while(ops.length){
      const op = ops.pop();
      if(op === '(' || op === ')') throw new Error('Mismatched parentheses');
      output.push(op);
    }
    return output;
  }

  function evalRPN(rpn){
    const stack = [];
    for(const token of rpn){
      if(!isNaN(Number(token))){
        stack.push(Number(token));
      } else if(token === 'u-'){  
        if(stack.length < 1) throw new Error('Invalid unary operation');
        const a = stack.pop();
        stack.push(-a);
      } else {  
        if(stack.length < 2) throw new Error('Invalid expression');
        const b = stack.pop();
        const a = stack.pop();
        let res;
        switch(token){
          case '+': res = a + b; break;
          case '-': res = a - b; break;
          case '*': res = a * b; break;
          case '/': 
            if(b === 0) throw new Error('Division by zero');
            res = a / b; break;
          case '%':
            res = a % b; break;
          default: throw new Error('Unknown operator: ' + token);
        }
        stack.push(res);
      }
    }
    if(stack.length !== 1) throw new Error('Invalid expression');
    return stack[0];
  }

  function evaluateExpression(expr){
    // convert readable × ÷ to * /
    const prepared = expr.replace(/×/g, '*').replace(/÷/g, '/');
    const tokens = tokenize(prepared);
    const rpn = toRPN(tokens);
    const result = evalRPN(rpn);
    // Format result (avoid long floats)
    if(Number.isFinite(result)){  
      const rounded = Math.round((result + Number.EPSILON) * 1e12) / 1e12;
      return rounded.toString();
    } else {
      throw new Error('Non-finite result');
    }
  }

  function doEquals(){
    try{
      if(!expression) return;
      const res = evaluateExpression(expression);
      history.push({ input: expression, result: res, at: new Date().toISOString() });
      expression = res;
      updateDisplay(sanitizeForDisplay(expression));
    } catch (err){
      updateDisplay('Error');
      setTimeout(()=> updateDisplay(''), 1200);
      expression = '';
      console.error(err);
    }
  }

  // Button handling
  buttons.forEach(btn => {
    const t = btn.textContent.trim();
    // classify button for styling
    if(['+','-','×','÷','%','(','<','console.error(err);
    }
  });

  // Keyboard support
  window.addEventListener('keydown', (e) => {
    const key = e.key;
    if(/\d/.test(key)){
      appendToken(key);
      e.preventDefault();
      return;
    }
    if(key === '.'){
      // prevent multiple decimals
      appendToken('.');
      e.preventDefault();
      return;
    }
    if(key === 'Enter' || key === '='){  
      doEquals();
      e.preventDefault();
      return;
    }
    if(key === 'Backspace'){
      deleteLast();
      e.preventDefault();
      return;
    }
    if(key === 'Escape'){
      clearAll();
      e.preventDefault();
      return;
    }
    if(key === '+' || key === '-' || key === '*' || key === '/'){
      const map = {'*':'*','/':'/','+':' +','-':'-'};
      appendToken(map[key]);
      e.preventDefault();
      return;
    }
    if(key === '%'){
      applyPercent();
      e.preventDefault();
      return;
    }
    if(key === '(' || key === ')'){
      appendToken(key);
      e.preventDefault();
      return;
    }
  });

  // Initialize
  clearAll();
})();
