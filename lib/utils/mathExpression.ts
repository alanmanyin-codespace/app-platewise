import { ParseError } from './ParseError';

type Token =
    | { type: 'number'; value: number }
    | { type: 'op'; value: '+' | '-' | '*' | 'x' | 'X' | '/' | '**' | '^' }
    | { type: 'lparen' }
    | { type: 'rparen' }
    | { type: 'comma' }
    | { type: 'function'; value: Func };

type Func =
    | 'abs'
    | 'acos'
    | 'asin'
    | 'atan'
    | 'ceil'
    | 'cos' // cosine
    | 'degtorad' // convert degrees to radians
    | 'exp' // exponential
    | 'floor'
    | 'fract' // fractional part, same as x - floor(x)
    | 'ln' // natural logarithm
    | 'log' // natural logarithm
    | 'log2' // base 2 logarithm
    | 'log10'
    | 'max' // maximum of numbers
    | 'min' // minimum of numbers
    | 'neg' // negative
    | 'radtodeg'
    | 'reciprocal' // 1/x
    | 'round'
    | 'sign' // sign -1, 0, 1
    | 'sin' // sine
    | 'sqrt' // square root
    | 'tan' // tangent
    | 'trunc'; // drop fractional part

// Functions that take a single argument
const unaryFunctions: Record<Lowercase<string>, (value: number) => number> = {
    abs: Math.abs,
    acos: Math.acos,
    asin: Math.asin,
    atan: Math.atan,
    ceil: Math.ceil,
    cos: Math.cos,
    degtorad: (x) => (x * Math.PI) / 180,
    exp: Math.exp,
    floor: Math.floor,
    fract: (x) => x - Math.floor(x),
    ln: Math.log,
    log: Math.log,
    log2: (x) => Math.log(x) / Math.log(2),
    log10: (x) => Math.log(x) / Math.log(10),
    neg: (x) => -x,
    radtodeg: (x) => (x * 180) / Math.PI,
    reciprocal: (x) => 1 / x,
    round: Math.round,
    sign: (x) => (x > 0 ? 1 : x < 0 ? -1 : 0),
    sin: Math.sin,
    sqrt: Math.sqrt,
    tan: Math.tan,
    trunc: Math.trunc
};

// Functions that take variable arguments
const variadicFunctions: Record<string, (...values: number[]) => number> = {
    max: (...values) => {
        if (values.length === 0) throw new ParseError('max() requires at least one argument');
        return Math.max(...values);
    },
    min: (...values) => {
        if (values.length === 0) throw new ParseError('min() requires at least one argument');
        return Math.min(...values);
    }
};

const allFunctionNames = new Set([
    ...Object.keys(unaryFunctions),
    ...Object.keys(variadicFunctions)
]);

export function tokenizeMathExpression(input: string): Token[] {
    const s = input.trim();
    const tokens: Token[] = [];
    let i = 0;

    const isDigit = (ch: string) => ch >= '0' && ch <= '9';
    const isAlpha = (ch: string) => (ch >= 'a' && ch <= 'z') || (ch >= 'A' && ch <= 'Z');

    while (i < s.length) {
        const ch = s[i];

        // whitespace
        if (ch === ' ' || ch === '\t' || ch === '\n' || ch === '\r') {
            i++;
            continue;
        }

        // parentheses and comma
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
        if (ch === ',') {
            tokens.push({ type: 'comma' });
            i++;
            continue;
        }

        // operators (handle ** first)
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
            // Check if it's a standalone x/X (multiplication) or part of a function name
            const nextCh = s[i + 1];
            if (nextCh && isAlpha(nextCh)) {
                // It's part of a function name, let the function parsing handle it
            } else {
                tokens.push({ type: 'op', value: '*' });
                i++;
                continue;
            }
        }
        if (ch === '+' || ch === '-' || ch === '/' || ch === '^') {
            tokens.push({ type: 'op', value: ch as Token & any });
            i++;
            continue;
        }

        // function names (can contain letters and digits, but must start with letter)
        if (isAlpha(ch)) {
            const start = i;
            while (i < s.length && (isAlpha(s[i]) || isDigit(s[i]))) {
                i++;
            }
            const name = s.slice(start, i).toLowerCase() as Func;
            if (allFunctionNames.has(name)) {
                tokens.push({ type: 'function', value: name });
            } else {
                throw new ParseError(`Unknown function: "${name}"`);
            }
            continue;
        }

        // numbers: 12, 12.34, .5, 1.
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
            if (raw === '.' || raw === '+.' || raw === '-.') {
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

export class MathExpressionParser {
    private idx = 0;

    constructor(private readonly tokens: Token[]) {}

    parse(): number {
        const value = this.parseExpression();
        if (this.idx !== this.tokens.length) {
            throw new ParseError(`Unexpected token after end of expression`);
        }
        return value;
    }

    // expression -> add/sub
    private parseExpression(): number {
        return this.parseAddSub();
    }

    // addSub -> mulDiv ( ( + | - ) mulDiv )*
    private parseAddSub(): number {
        let left = this.parseMulDiv();

        while (true) {
            const op = this.peekOp(['+', '-']);
            if (!op) break;
            this.idx++;

            const right = this.parseMulDiv();
            left = op === '+' ? left + right : left - right;
        }

        return left;
    }

    // mulDiv -> power ( ( * | / ) power )*
    private parseMulDiv(): number {
        let left = this.parsePower();

        while (true) {
            const op = this.peekOp(['*', '/']);
            if (!op) break;
            this.idx++;

            const right = this.parsePower();
            left = op === '/' ? left / right : left * right;
        }

        return left;
    }

    // power -> unary ( ( ** | ^ ) power )?
    // Right-associative: 2 ** 3 ** 2 = 2 ** (3 ** 2)
    private parsePower(): number {
        const left = this.parseUnary();
        const op = this.peekOp(['**', '^']);
        if (!op) return left;

        this.idx++;
        const right = this.parsePower();
        return Math.pow(left, right);
    }

    // unary -> ( + | - ) unary | primary
    private parseUnary(): number {
        const op = this.peekOp(['+', '-']);
        if (op) {
            this.idx++;
            const v = this.parseUnary();
            return op === '-' ? -v : v;
        }
        return this.parsePrimary();
    }

    // primary -> number | ( expression ) | function ( args )
    private parsePrimary(): number {
        const tok = this.tokens[this.idx];
        if (!tok) {
            throw new ParseError('Unexpected end of expression');
        }

        if (tok.type === 'number') {
            this.idx++;
            return tok.value;
        }

        if (tok.type === 'function') {
            const fnName = tok.value;
            this.idx++;

            const next = this.tokens[this.idx];
            if (next?.type !== 'lparen') {
                throw new ParseError(`Expected '(' after function ${fnName}`);
            }
            this.idx++;

            // Parse function arguments (comma-separated expressions)
            const args: number[] = [];

            // Check for empty argument list
            if (this.tokens[this.idx]?.type === 'rparen') {
                this.idx++;
                // Apply the function with no arguments
                return this.applyFunction(fnName, args);
            }

            // Parse first argument
            args.push(this.parseExpression());

            // Parse remaining arguments
            while (this.tokens[this.idx]?.type === 'comma') {
                this.idx++; // consume comma
                args.push(this.parseExpression());
            }

            const closeParen = this.tokens[this.idx];
            if (closeParen?.type !== 'rparen') {
                throw new ParseError("Missing closing ')' for function call");
            }
            this.idx++;

            return this.applyFunction(fnName, args);
        }

        if (tok.type === 'lparen') {
            this.idx++;
            const v = this.parseExpression();
            const next = this.tokens[this.idx];
            if (next?.type !== 'rparen') {
                throw new ParseError("Missing closing ')'");
            }
            this.idx++;
            return v;
        }

        throw new ParseError("Expected a number, function, or '('");
    }

    private applyFunction(fnName: string, args: number[]): number {
        // Check if it's a variadic function
        if (fnName in variadicFunctions) {
            return variadicFunctions[fnName](...args);
        }

        // Check if it's a unary function
        if (fnName in unaryFunctions) {
            if (args.length !== 1) {
                throw new ParseError(
                    `Function ${fnName}() expects exactly 1 argument, got ${args.length}`
                );
            }
            return unaryFunctions[fnName as keyof typeof unaryFunctions](args[0]);
        }

        throw new ParseError(`Unknown function: ${fnName}`);
    }

    private peekOp(
        ops: Array<Token extends any ? any : never>
    ): '+' | '-' | '*' | 'x' | 'X' | '/' | '**' | '^' | null {
        const tok = this.tokens[this.idx];
        if (tok?.type !== 'op') return null;
        if ((ops as string[]).includes(tok.value)) return tok.value;
        return null;
    }
}
