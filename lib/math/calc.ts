import { createSafeFunction } from '../utils/createSafeFunction';
import { MathExpressionParser, tokenizeMathExpression } from '../utils/mathExpression';
import { ParseError } from '../utils/ParseError';

export type Calc = (expression?: string) => number;

export const calc: Calc = (expression) => {
    const tokens = tokenizeMathExpression(String(expression ?? ''));
    if (tokens.length === 0) {
        throw new ParseError('Empty expression');
    }

    const result = new MathExpressionParser(tokens).parse();

    return Object.is(result, -0) ? 0 : result;
};

export const calcSafe = createSafeFunction(calc);
