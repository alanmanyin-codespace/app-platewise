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
            // if parsing fails, treat the condition as false and continue
            console.warn(`Failed to parse condition "${rule.condition}":`, error);
        }
    }

    return elseValue;
};

export const conditionalSafe = createSafeFunction(conditional);
