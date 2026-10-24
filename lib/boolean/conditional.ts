import { createSafeFunction } from '../utils/createSafeFunction';
import { LogicalExpressionParser, tokenizeLogicalExpression } from '../utils/logicalExpression';

type Rule = {
    condition?: string | boolean;
    value?: any;
};

export type Conditional = (rules: Rule[], elseValue?: any) => any;

export const conditional: Conditional = (rules, elseValue) => {
    if (!Array.isArray(rules)) {
        return elseValue;
    }

    for (const rule of rules) {
        try {
            const tokens = tokenizeLogicalExpression(String(rule.condition ?? ''));
            if (tokens.length === 0) {
                continue;
            }

            const result = new LogicalExpressionParser(tokens).parse();
            if (result) {
                return rule.value;
            }
        } catch (error) {
            // The expression language also accepts unquoted display labels such as
            // "All Stores = Metro". They are not valid logical-expression tokens,
            // so handle simple equality without evaluating arbitrary code.
            const condition = String(rule.condition ?? '').trim();
            const match = condition.match(/^(.+?)\s*(===|==|=|!==|!=|<>)\s*(.+)$/);
            if (match) {
                const [, left, operator, right] = match;
                const equal = left.trim() === right.trim();
                if ((operator === '=' || operator === '==' || operator === '===') ? equal : !equal) {
                    return rule.value;
                }
            } else {
                // if parsing fails, treat the condition as false and continue
                console.warn(`Failed to parse condition "${rule.condition}":`, error);
            }
        }
    }

    return elseValue;
};

export const conditionalSafe = createSafeFunction(conditional);
