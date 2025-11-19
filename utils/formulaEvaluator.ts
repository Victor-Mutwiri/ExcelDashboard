
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
 * This version handles unary minus signs correctly.
 * Example: "( {col_1} + -100 ) * -2" -> ["(", "{col_1}", "+", "-100", ")", "*", "-2"]
 */
export const tokenize = (formula: string): string[] => {
  // Use a regex that can identify numbers (including negatives), column placeholders, and operators
  const regex = /({[^}]+})|(-?\d*\.?\d+)|([+\-*/()])/g;
  const tokens: string[] = [];
  let match;
  while ((match = regex.exec(formula)) !== null) {
    tokens.push(match[0]);
  }
  return tokens;
};

/**
 * Converts an array of infix tokens to a postfix (Reverse Polish Notation) array
 * using the Shunting-yard algorithm. This correctly handles operator precedence.
 */
const toPostfix = (tokens: string[]): string[] => {
  const outputQueue: string[] = [];
  const operatorStack: string[] = [];
  let lastTokenWasOperator = true; // Start as true to handle leading unary minus

  for (const token of tokens) {
    if (!isNaN(parseFloat(token))) { // It's a number
      outputQueue.push(token);
      lastTokenWasOperator = false;
    } else if (token.startsWith('{') && token.endsWith('}')) { // It's a column placeholder
        outputQueue.push(token);
        lastTokenWasOperator = false;
    } else if (token === '-' && lastTokenWasOperator) { // Unary minus
      // This is a simplification; for a full implementation, we'd handle it differently
      // But since our tokenizer already creates negative numbers, we just need to ensure it's not treated as a binary op
      // In this setup, tokenize already handles it, so this branch might be more for validation
      operatorStack.push(token); // Or handle as part of a number
      lastTokenWasOperator = true;
    } else if (token in precedence) { // It's a binary operator
      while (
        operatorStack.length > 0 &&
        operatorStack[operatorStack.length - 1] !== '(' &&
        precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
      ) {
        outputQueue.push(operatorStack.pop()!);
      }
      operatorStack.push(token);
      lastTokenWasOperator = true;
    } else if (token === '(') {
      operatorStack.push(token);
      lastTokenWasOperator = true;
    } else if (token === ')') {
      while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
        outputQueue.push(operatorStack.pop()!);
      }
      if (operatorStack[operatorStack.length - 1] === '(') {
        operatorStack.pop(); // Discard the '('
      } else {
        throw new Error('Mismatched parentheses');
      }
      lastTokenWasOperator = false;
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
      if (stack.length < 2) { // Binary operators need two operands
        // This could be a unary minus if the tokenizer didn't handle it
        if (token === '-' && stack.length === 1) {
          const a = stack.pop()!;
          stack.push(-a);
          continue;
        }
        throw new Error('Invalid expression syntax');
      }
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
        // A simple pre-processing step to handle unary minus correctly for our shunting-yard
        const processedFormula = formula.replace(/(\(\s*)-/g, '$1 -1 * ').replace(/,\s*-/g, ', -1 * ');
        const tokens = tokenize(processedFormula);
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
        // Quick check for hanging operators
        const lastToken = tokens[tokens.length -1];
        if (lastToken in precedence) {
            return { isValid: false, error: 'Formula cannot end with an operator.'};
        }
        toPostfix(tokens); // This will throw an error on syntax issues like mismatched parens.
        return { isValid: true };
    } catch (error: any) {
        return { isValid: false, error: error.message || 'Invalid formula syntax.' };
    }
}
