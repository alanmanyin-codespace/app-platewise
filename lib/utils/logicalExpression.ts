import { contains } from '../boolean/contains';
import { endsWith } from '../boolean/endsWith';
import { isEqual } from '../boolean/isEqual';
import { startsWith } from '../boolean/startsWith';

import { ParseError } from './ParseError';

type Logical = 'AND' | 'OR';
type Keyword = 'NOT' | 'HAS' | 'CONTAINS' | 'STARTS' | 'ENDS' | 'TRUE' | 'FALSE';

type Token =
    | { type: 'number'; value: number }
    | { type: 'string'; value: string }
    | { type: 'op'; value: '+' | '-' | '*' | 'x' | 'X' | '/' | '**' | '^' }
    | {
          type: 'comparison';
          value: '=' | '==' | '!=' | '!==' | '===' | '<>' | '>' | '>=' | '<' | '<=';
      }
    | { type: 'logical'; value: Logical }
    | { type: 'keyword'; value: Keyword }
    | { type: 'lparen' }
    | { type: 'rparen' };

const ALIASES = new Map([['HAS', 'CONTAINS']]);
const KEYWORDS = new Set(['NOT', 'CONTAINS', 'STARTS', 'ENDS', 'TRUE', 'FALSE']);
const LOGICAL = new Set(['AND', 'OR']);

export function tokenizeLogicalExpression(input: string): Token[] {
    const s = input.trim();
    const tokens: Token[] = [];
    let i = 0;

    const isDigit = (ch: string) => ch >= '0' && ch <= '9';
    const isAlpha = (ch: string) =>
        (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z') || ch === '_';
    const isAlphaNum = (ch: string) => isAlpha(ch) || isDigit(ch);

    while (i < s.length) {
        const ch = s[i];

        // whitespace
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            i++;
            continue;
        }

        // parentheses
        if (ch === '(') {
            tokens.push({ type: 'lparen' });
            i++;
            continue;
        }
        if (ch === ')') {
            tokens.push({ type: 'rparen' });
            i++;
            continue;
        }

        // string literals (single and double quotes)
        if (ch === '"' || ch === "'") {
            const quote = ch;
            i++; // skip opening quote
            let str = '';
            while (i < s.length && s[i] !== quote) {
                if (s[i] === '\\' && i + 1 < s.length) {
                    // handle escape sequences
                    i++;
                    const next = s[i];
                    if (next === 'n') str += '\n';
                    else if (next === 't') str += '\t';
                    else if (next === 'r') str += '\r';
                    else if (next === '\\') str += '\\';
                    else if (next === quote) str += quote;
                    else str += next;
                    i++;
                } else {
                    str += s[i];
                    i++;
                }
            }
            if (i >= s.length) {
                throw new ParseError(`Unterminated string starting with ${quote}`);
            }
            i++; // skip closing quote
            tokens.push({ type: 'string', value: str });
            continue;
        }

        // comparison operators
        if (ch === '=') {
            if (s[i + 1] === '=' && s[i + 2] === '=') {
                tokens.push({ type: 'comparison', value: '===' });
                i += 3;
            } else if (s[i + 1] === '=') {
                tokens.push({ type: 'comparison', value: '==' });
                i += 2;
            } else {
                tokens.push({ type: 'comparison', value: '=' });
                i++;
            }
            continue;
        }
        if (ch === '!') {
            if (s[i + 1] === '=' && s[i + 2] === '=') {
                tokens.push({ type: 'comparison', value: '!==' });
                i += 3;
            } else if (s[i + 1] === '=') {
                tokens.push({ type: 'comparison', value: '!=' });
                i += 2;
            } else {
                throw new ParseError(`Unexpected character "!" at position ${i}`);
            }
            continue;
        }
        if (ch === '<' && s[i + 1] === '>') {
            tokens.push({ type: 'comparison', value: '!=' });
            i += 2;
            continue;
        }
        if (ch === '>') {
            if (s[i + 1] === '=') {
                tokens.push({ type: 'comparison', value: '>=' });
                i += 2;
            } else {
                tokens.push({ type: 'comparison', value: '>' });
                i++;
            }
            continue;
        }
        if (ch === '<') {
            if (s[i + 1] === '=') {
                tokens.push({ type: 'comparison', value: '<=' });
                i += 2;
            } else {
                tokens.push({ type: 'comparison', value: '<' });
                i++;
            }
            continue;
        }

        // arithmetic operators
        if (ch === '*') {
            if (s[i + 1] === '*') {
                tokens.push({ type: 'op', value: '**' });
                i += 2;
            } else {
                tokens.push({ type: 'op', value: '*' });
                i++;
            }
            continue;
        }
        if (ch === 'x' || ch === 'X') {
            tokens.push({ type: 'op', value: '*' });
            i++;
            continue;
        }

        if (ch === '+' || ch === '-' || ch === '/' || ch === '^') {
            tokens.push({ type: 'op', value: ch as Token & any });
            i++;
            continue;
        }

        // logical operators and keywords (&&, ||, AND, OR, NOT, HAS, etc.)
        if (ch === '&' && s[i + 1] === '&') {
            tokens.push({ type: 'logical', value: 'AND' });
            i += 2;
            continue;
        }
        if (ch === '|' && s[i + 1] === '|') {
            tokens.push({ type: 'logical', value: 'OR' });
            i += 2;
            continue;
        }

        // keywords (AND, OR, NOT, HAS, CONTAINS, STARTS, ENDS, TRUE, FALSE)
        if (isAlpha(ch)) {
            const start = i;
            while (i < s.length && isAlphaNum(s[i])) {
                i++;
            }
            const word = s.slice(start, i);
            let upper = word.toUpperCase();
            if (ALIASES.has(upper)) {
                upper = ALIASES.get(upper)!;
            }

            if (LOGICAL.has(upper)) {
                tokens.push({ type: 'logical', value: upper as Logical });
            } else if (KEYWORDS.has(upper)) {
                tokens.push({ type: 'keyword', value: upper as Keyword });
            } else {
                throw new ParseError(`Unknown keyword "${word}" at position ${start}`);
            }
            continue;
        }

        // numbers
        if (isDigit(ch) || ch === '.') {
            const start = i;
            let sawDot = false;

            if (ch === '.') sawDot = true;

            i++;
            while (i < s.length) {
                const c = s[i];
                if (isDigit(c)) {
                    i++;
                    continue;
                }
                if (c === '.' && !sawDot) {
                    sawDot = true;
                    i++;
                    continue;
                }
                break;
            }

            const raw = s.slice(start, i);
            if (raw === '.') {
                throw new ParseError(`Invalid number: "${raw}"`);
            }
            const value = Number(raw);
            if (!Number.isFinite(value)) {
                throw new ParseError(`Invalid number: "${raw}"`);
            }
            tokens.push({ type: 'number', value });
            continue;
        }

        throw new ParseError(`Unexpected character "${ch}" at position ${i}`);
    }

    return tokens;
}

export class LogicalExpressionParser {
    private idx = 0;

    constructor(private readonly tokens: Token[]) {}

    parse(): boolean {
        const value = this.parseExpression();
        if (this.idx !== this.tokens.length) {
            throw new ParseError(`Unexpected token after end of expression`);
        }
        return this.toBoolean(value);
    }

    // expression -> logicalOr
    private parseExpression(): any {
        return this.parseLogicalOr();
    }

    // logicalOr -> logicalAnd ( OR logicalAnd )*
    private parseLogicalOr(): any {
        let left = this.parseLogicalAnd();

        while (true) {
            const tok = this.tokens[this.idx];
            if (tok?.type !== 'logical' || tok.value !== 'OR') break;
            this.idx++;
            const right = this.parseLogicalAnd();
            left = this.toBoolean(left) || this.toBoolean(right);
        }

        return left;
    }

    // logicalAnd -> comparison ( AND comparison )*
    private parseLogicalAnd(): any {
        let left = this.parseComparison();

        while (true) {
            const tok = this.tokens[this.idx];
            if (tok?.type !== 'logical' || tok.value !== 'AND') break;
            this.idx++;
            const right = this.parseComparison();
            left = this.toBoolean(left) && this.toBoolean(right);
        }

        return left;
    }

    // comparison -> relational ( comparisonOp relational | specialOp relational )?
    private parseComparison(): any {
        const left = this.parseRelational();

        const tok = this.tokens[this.idx];
        if (!tok) return left;

        // special operators: HAS/CONTAINS, STARTS, ENDS
        if (tok.type === 'keyword') {
            const op = tok.value;
            this.idx++;
            const right = this.parseRelational();

            switch (op) {
                case 'CONTAINS':
                    return contains(left, right);
                case 'STARTS':
                    return startsWith(left, right);
                case 'ENDS':
                    return endsWith(left, right);
            }
        }

        // if no comparison operator, return the value as-is
        return left;
    }

    // relational -> additive ( comparisonOp additive )?
    private parseRelational(): any {
        const left = this.parseAdditive();

        const tok = this.tokens[this.idx];
        if (!tok) return left;

        // comparison operators: =, ==, !=, !==, ===, >, >=, <, <=
        if (tok.type === 'comparison') {
            const op = tok.value;
            this.idx++;
            const right = this.parseAdditive();

            switch (op) {
                case '=':
                case '==':
                    return isEqual(left, right);
                case '!=':
                case '<>':
                    return !isEqual(left, right);
                case '===':
                    return isEqual(left, right, true);
                case '!==':
                    return !isEqual(left, right, true);
                case '>':
                    return Number(left) > Number(right);
                case '>=':
                    return Number(left) >= Number(right);
                case '<':
                    return Number(left) < Number(right);
                case '<=':
                    return Number(left) <= Number(right);
            }
        }

        return left;
    }

    // additive -> multiplicative ( ( + | - ) multiplicative )*
    private parseAdditive(): any {
        let left = this.parseMultiplicative();

        while (true) {
            const tok = this.tokens[this.idx];
            if (tok?.type !== 'op' || (tok.value !== '+' && tok.value !== '-')) break;
            const op = tok.value;
            this.idx++;
            const right = this.parseMultiplicative();
            left = op === '+' ? Number(left) + Number(right) : Number(left) - Number(right);
        }

        return left;
    }

    // multiplicative -> power ( ( * | / ) power )*
    private parseMultiplicative(): any {
        let left = this.parsePower();

        while (true) {
            const tok = this.tokens[this.idx];
            if (tok?.type !== 'op' || (tok.value !== '*' && tok.value !== '/')) break;
            const op = tok.value;
            this.idx++;
            const right = this.parsePower();
            left = op === '*' ? Number(left) * Number(right) : Number(left) / Number(right);
        }

        return left;
    }

    // power -> unary ( ^ unary )?
    private parsePower(): any {
        const left = this.parseUnary();
        const tok = this.tokens[this.idx];
        if (tok?.type !== 'op' || tok.value !== '^') return left;

        this.idx++;
        const right = this.parsePower(); // right associative
        return Math.pow(Number(left), Number(right));
    }

    // unary -> NOT unary | ( + | - ) unary | primary
    private parseUnary(): any {
        const tok = this.tokens[this.idx];
        if (!tok) {
            throw new ParseError('Unexpected end of expression');
        }

        // NOT operator
        if (tok.type === 'keyword') {
            if (tok.value === 'NOT') {
                this.idx++;
                // NOT must be followed by (...)
                const nextTok = this.tokens[this.idx];
                if (nextTok?.type !== 'lparen') {
                    throw new ParseError('NOT must be followed by parentheses');
                }
                this.idx++; // skip '('
                const v = this.parseExpression();
                const closeTok = this.tokens[this.idx];
                if (closeTok?.type !== 'rparen') {
                    throw new ParseError("Missing closing ')' after NOT");
                }
                this.idx++; // skip ')'
                return !v;
            }

            if (tok.value === 'TRUE') {
                this.idx++;
                return true;
            }

            if (tok.value === 'FALSE') {
                this.idx++;
                return false;
            }
        }

        // unary + or -
        if (tok.type === 'op' && (tok.value === '+' || tok.value === '-')) {
            const op = tok.value;
            this.idx++;
            const v = this.parseUnary();
            return op === '-' ? -Number(v) : Number(v);
        }

        return this.parsePrimary();
    }

    // primary -> number | string | ( logicalOr )
    private parsePrimary(): any {
        const tok = this.tokens[this.idx];
        if (!tok) {
            throw new ParseError('Unexpected end of expression');
        }

        if (tok.type === 'number') {
            this.idx++;
            return tok.value;
        }

        if (tok.type === 'string') {
            this.idx++;
            return tok.value;
        }

        if (tok.type === 'lparen') {
            this.idx++;
            // Parse full logical expression inside parentheses
            // This allows arithmetic expressions like (2+3), comparison expressions like (5 > 3),
            // and logical expressions like (5 > 3 AND 10 > 7)
            const v = this.parseLogicalOr();
            const next = this.tokens[this.idx];
            if (next?.type !== 'rparen') {
                throw new ParseError("Missing closing ')'");
            }
            this.idx++;
            return v;
        }

        throw new ParseError(`Unexpected token: ${JSON.stringify(tok)}`);
    }

    private toBoolean(value: any): boolean {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') return value !== 0;
        if (typeof value === 'string') return value.length > 0;
        return !!value;
    }
}
