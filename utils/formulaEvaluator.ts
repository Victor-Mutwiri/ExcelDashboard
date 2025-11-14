// A safe formula evaluator that respects order of operations.

// Define operator precedence for PEMDAS/BODMAS
const precedence: Record<string, number> = {
  '+': 1,
  '-': 1,
  '*': 2,
  '/': 2,
};

/**
 * Tokenizes the formula string into an array of numbers, operators, and placeholders.
 * Example: "( {col_1} + 100 ) * 2" -> ["(", "{col_1}", "+", "100", ")", "*", "2"]
 */
const tokenize = (formula: string): string[] => {
  const spacedFormula = formula.replace(/([+\-*/()])/g, ' $1 ');
  return spacedFormula.trim().split(/\s+/);
};

/**
 * Converts an array of infix tokens to a postfix (Reverse Polish Notation) array
 * using the Shunting-yard algorithm. This correctly handles operator precedence.
 */
const toPostfix = (tokens: string[]): string[] => {
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) { // It's a number
      outputQueue.push(token);
    } else if (token.startsWith('{') && token.endsWith('}')) { // It's a column placeholder
        outputQueue.push(token);
    } else if (token in precedence) { // It's an operator
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
    } else if (token === '(') {
      operatorStack.push(token);
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop(); // Discard the '('
      } else {
        throw new Error('Mismatched parentheses');
      }
    } else {
        throw new Error(`Invalid token: ${token}`);
    }
  }

  while (operatorStack.length > 0) {
    const operator = operatorStack.pop()!;
    if (operator === '(' || operator === ')') {
        throw new Error('Mismatched parentheses');
    }
    outputQueue.push(operator);
  }

  return outputQueue;
};

/**
 * Evaluates a postfix expression using a stack.
 * @param postfixTokens The RPN token array.
 * @param rowValues A map of column IDs (e.g., 'col_1') to their numeric values for the current row.
 */
const evaluatePostfix = (postfixTokens: string[], rowValues: Record<string, number>): number | null => {
  const stack: number[] = [];

  for (const token of postfixTokens) {
    if (!isNaN(parseFloat(token))) {
      stack.push(parseFloat(token));
    } else if (token.startsWith('{') && token.endsWith('}')) {
        const colId = token.slice(1, -1);
        const value = rowValues[colId];
        if (typeof value !== 'number') return null; // Dependency value is missing or invalid
        stack.push(value);
    } else if (token in precedence) {
      if (stack.length < 2) throw new Error('Invalid expression syntax');
      const b = stack.pop()!;
      const a = stack.pop()!;
      switch (token) {
        case '+': stack.push(a + b); break;
        case '-': stack.push(a - b); break;
        case '*': stack.push(a * b); break;
        case '/':
          if (b === 0) return null; // Division by zero results in null
          stack.push(a / b);
          break;
      }
    }
  }
  if (stack.length !== 1) throw new Error('Invalid expression syntax');
  return stack[0];
};

/**
 * Public function to evaluate a formula string against a set of row values.
 */
export const evaluateFormula = (formula: string, rowValues: Record<string, number>): number | null => {
    try {
        const tokens = tokenize(formula);
        const postfix = toPostfix(tokens);
        return evaluatePostfix(postfix, rowValues);
    } catch (error) {
        console.error("Formula evaluation error:", error);
        return null;
    }
};

/**
 * Public function to validate the syntax of a formula string.
 */
export const validateFormula = (formula: string): { isValid: boolean, error?: string } => {
    if (!formula.trim()) {
        return { isValid: false, error: 'Formula cannot be empty.' };
    }
    try {
        const tokens = tokenize(formula);
        toPostfix(tokens); // This will throw an error on syntax issues like mismatched parens.
        return { isValid: true };
    } catch (error: any) {
        return { isValid: false, error: error.message || 'Invalid formula syntax.' };
    }
}
