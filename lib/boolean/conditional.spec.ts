import { describe, it, expect, vi } from 'vitest';
import { conditional } from './conditional';

describe('conditional', () => {
    describe('basic equality operators', () => {
        it('should handle loose equality (=, ==)', () => {
            expect(
                conditional(
                    [
                        { condition: '5 = 5', value: 'match' },
                        { condition: '1 = 2', value: 'no-match' }
                    ],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [
                        { condition: '5 == 5', value: 'match' },
                        { condition: '1 == 2', value: 'no-match' }
                    ],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [
                        { condition: '"hello" = "hello"', value: 'match' },
                        { condition: '"hello" = "world"', value: 'no-match' }
                    ],
                    'default'
                )
            ).toBe('match');

            // loose equality ignores case by default
            expect(
                conditional([{ condition: '"Hello" = "hello"', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle loose inequality (!=)', () => {
            expect(conditional([{ condition: '5 != 3', value: 'match' }], 'default')).toBe('match');

            expect(conditional([{ condition: '5 <> 5', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle strict equality (===)', () => {
            expect(
                conditional([{ condition: '"Hello" === "Hello"', value: 'match' }], 'default')
            ).toBe('match');

            // strict equality is case-sensitive
            expect(
                conditional([{ condition: '"Hello" === "hello"', value: 'match' }], 'default')
            ).toBe('default');
        });

        it('should handle strict inequality (!==)', () => {
            expect(
                conditional([{ condition: '"Hello" !== "hello"', value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional([{ condition: '"hello" !== "hello"', value: 'match' }], 'default')
            ).toBe('default');
        });
    });

    describe('comparison operators', () => {
        it('should handle greater than (>)', () => {
            expect(conditional([{ condition: '10 > 5', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '5 > 10', value: 'match' }], 'default')).toBe(
                'default'
            );
            expect(conditional([{ condition: '5 > 5', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle greater than or equal (>=)', () => {
            expect(conditional([{ condition: '10 >= 5', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '5 >= 5', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '5 >= 10', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle less than (<)', () => {
            expect(conditional([{ condition: '5 < 10', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '10 < 5', value: 'match' }], 'default')).toBe(
                'default'
            );
            expect(conditional([{ condition: '5 < 5', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle less than or equal (<=)', () => {
            expect(conditional([{ condition: '5 <= 10', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '5 <= 5', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '10 <= 5', value: 'match' }], 'default')).toBe(
                'default'
            );
        });
    });

    describe('logical operators', () => {
        it('should handle AND (&&)', () => {
            expect(conditional([{ condition: '5 > 3 && 10 > 7', value: 'match' }], 'default')).toBe(
                'match'
            );

            expect(conditional([{ condition: '5 > 3 && 10 < 7', value: 'match' }], 'default')).toBe(
                'default'
            );

            expect(conditional([{ condition: '5 < 3 && 10 > 7', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle AND keyword (case-insensitive)', () => {
            expect(
                conditional([{ condition: '5 > 3 AND 10 > 7', value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional([{ condition: '5 > 3 and 10 > 7', value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional([{ condition: '5 > 3 And 10 > 7', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle OR (||)', () => {
            expect(conditional([{ condition: '5 > 3 || 10 < 7', value: 'match' }], 'default')).toBe(
                'match'
            );

            expect(conditional([{ condition: '5 < 3 || 10 > 7', value: 'match' }], 'default')).toBe(
                'match'
            );

            expect(conditional([{ condition: '5 < 3 || 10 < 7', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle OR keyword (case-insensitive)', () => {
            expect(conditional([{ condition: '5 > 3 OR 10 < 7', value: 'match' }], 'default')).toBe(
                'match'
            );

            expect(conditional([{ condition: '5 > 3 or 10 < 7', value: 'match' }], 'default')).toBe(
                'match'
            );

            expect(conditional([{ condition: '5 > 3 Or 10 < 7', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle NOT operator with parentheses', () => {
            expect(conditional([{ condition: 'NOT(5 < 3)', value: 'match' }], 'default')).toBe(
                'match'
            );

            expect(conditional([{ condition: 'NOT(5 > 3)', value: 'match' }], 'default')).toBe(
                'default'
            );

            expect(conditional([{ condition: 'not(5 > 3)', value: 'match' }], 'default')).toBe(
                'default'
            );

            expect(conditional([{ condition: 'Not(5 > 3)', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle complex logical combinations', () => {
            expect(
                conditional(
                    [{ condition: '(5 > 3 AND 10 > 7) OR (2 < 1)', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '(5 < 3 AND 10 > 7) OR (2 > 1)', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '(5 < 3 OR 10 < 7) AND (2 < 1)', value: 'match' }],
                    'default'
                )
            ).toBe('default');
        });
    });

    describe('math operators', () => {
        it('should handle addition (+)', () => {
            expect(conditional([{ condition: '5 + 3 = 8', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '2 + 3 + 4 = 9', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle subtraction (-)', () => {
            expect(conditional([{ condition: '10 - 3 = 7', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '10 - 3 - 2 = 5', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle multiplication (*)', () => {
            expect(conditional([{ condition: '5 * 3 = 15', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '2 * 3 * 4 = 24', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle division (/)', () => {
            expect(conditional([{ condition: '15 / 3 = 5', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(
                conditional([{ condition: '20 / 4 / 2 = 2.5', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle exponentiation (^)', () => {
            expect(conditional([{ condition: '2 ^ 3 = 8', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '5 ^ 2 = 25', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle operator precedence', () => {
            expect(conditional([{ condition: '2 + 3 * 4 = 14', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '10 - 2 * 3 = 4', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '2 ^ 3 * 2 = 16', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle parentheses for grouping', () => {
            expect(
                conditional([{ condition: '(2 + 3) * 4 = 20', value: 'match' }], 'default')
            ).toBe('match');
            expect(
                conditional([{ condition: '(10 - 2) * 3 = 24', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle unary operators', () => {
            expect(conditional([{ condition: '-5 + 10 = 5', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '+5 = 5', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '-(-5) = 5', value: 'match' }], 'default')).toBe(
                'match'
            );
        });
    });

    describe('string operators', () => {
        it('should handle single and double quotes', () => {
            expect(
                conditional([{ condition: '"hello" = "hello"', value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional([{ condition: "'hello' = 'hello'", value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional([{ condition: '"hello" = \'hello\'', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle HAS/CONTAINS operator', () => {
            expect(
                conditional([{ condition: '"hello world" HAS "world"', value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello world" CONTAINS "world"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello world" contains "world"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional([{ condition: '"hello world" HAS "foo"', value: 'match' }], 'default')
            ).toBe('default');
        });

        it('should handle STARTS operator', () => {
            expect(
                conditional(
                    [{ condition: '"hello world" STARTS "hello"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello world" starts "hello"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello world" STARTS "world"', value: 'match' }],
                    'default'
                )
            ).toBe('default');
        });

        it('should handle ENDS operator', () => {
            expect(
                conditional(
                    [{ condition: '"hello world" ENDS "world"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello world" ends "world"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello world" ENDS "hello"', value: 'match' }],
                    'default'
                )
            ).toBe('default');
        });

        it('should handle TRUE keyword', () => {
            expect(conditional([{ condition: 'TRUE', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: 'true || false', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle FALSE keyword', () => {
            expect(conditional([{ condition: 'FALSE', value: 'match' }], 'default')).toBe(
                'default'
            );
            expect(conditional([{ condition: 'true && false', value: 'match' }], 'default')).toBe(
                'default'
            );
        });

        it('should handle escape sequences in strings', () => {
            expect(
                conditional(
                    [{ condition: '"hello\\nworld" CONTAINS "\\n"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello\\tworld" CONTAINS "\\t"', value: 'match' }],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [{ condition: '"hello\\"world" CONTAINS "\\""', value: 'match' }],
                    'default'
                )
            ).toBe('match');
        });
    });

    describe('complex expressions', () => {
        it('should handle mixed operators', () => {
            expect(
                conditional(
                    [
                        {
                            condition: '(5 + 3) > 7 AND "hello" CONTAINS "ell"',
                            value: 'match'
                        }
                    ],
                    'default'
                )
            ).toBe('match');

            expect(
                conditional(
                    [
                        {
                            condition: '10 / 2 = 5 OR "world" STARTS "wor"',
                            value: 'match'
                        }
                    ],
                    'default'
                )
            ).toBe('match');
        });

        it('should handle deeply nested parentheses', () => {
            expect(
                conditional([{ condition: '((5 + 3) * 2) = 16', value: 'match' }], 'default')
            ).toBe('match');

            expect(
                conditional([{ condition: '(((2 + 1) * 3) - 1) = 8', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle complex logical expressions', () => {
            expect(
                conditional(
                    [
                        {
                            condition:
                                '(5 > 3 AND 10 < 20) OR (NOT("hello" = "world") AND 2 + 2 = 4)',
                            value: 'match'
                        }
                    ],
                    'default'
                )
            ).toBe('match');
        });
    });

    describe('multiple rules', () => {
        it('should return first matching rule', () => {
            const result = conditional(
                [
                    { condition: '5 < 3', value: 'first' },
                    { condition: '10 > 5', value: 'second' },
                    { condition: '2 = 2', value: 'third' }
                ],
                'default'
            );

            expect(result).toBe('second');
        });

        it('should return else value if no rules match', () => {
            const result = conditional(
                [
                    { condition: '5 < 3', value: 'first' },
                    { condition: '10 < 5', value: 'second' },
                    { condition: '2 != 2', value: 'third' }
                ],
                'else-value'
            );

            expect(result).toBe('else-value');
        });

        it('should skip invalid conditions and continue', () => {
            const mock = vi.spyOn(console, 'warn').mockImplementation(() => {});
            const result = conditional(
                [
                    { condition: 'invalid syntax !!!', value: 'first' },
                    { condition: '10 > 5', value: 'second' },
                    { condition: '2 = 2', value: 'third' }
                ],
                'default'
            );

            expect(result).toBe('second');
            expect(mock).toHaveBeenCalledTimes(1);

            mock.mockRestore();
        });
    });

    describe('edge cases', () => {
        it('should handle empty string conditions', () => {
            expect(conditional([{ condition: '', value: 'match' }], 'default')).toBe('default');
        });

        it('should handle whitespace-only conditions', () => {
            expect(conditional([{ condition: '   ', value: 'match' }], 'default')).toBe('default');
        });

        it('should handle decimal numbers', () => {
            expect(conditional([{ condition: '3.14 > 3', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '0.5 + 0.5 = 1', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle negative numbers', () => {
            expect(conditional([{ condition: '-5 < 0', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '-10 + 5 = -5', value: 'match' }], 'default')).toBe(
                'match'
            );
        });

        it('should handle empty strings in comparisons', () => {
            expect(conditional([{ condition: '"" = ""', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(
                conditional([{ condition: '"hello" CONTAINS ""', value: 'match' }], 'default')
            ).toBe('match');
        });

        it('should handle truthiness for standalone values', () => {
            expect(conditional([{ condition: '1', value: 'match' }], 'default')).toBe('match');
            expect(conditional([{ condition: '0', value: 'match' }], 'default')).toBe('default');
            expect(conditional([{ condition: '"hello"', value: 'match' }], 'default')).toBe(
                'match'
            );
            expect(conditional([{ condition: '""', value: 'match' }], 'default')).toBe('default');
        });
    });
});

// Date string comparisons (ISO) — ensures parser handles them as strings consistently
describe('date string comparisons', () => {
    it('should treat identical ISO date strings as equal with loose equality', () => {
        expect(
            conditional(
                [{ condition: '"2024-01-01T00:00:00Z" = "2024-01-01T00:00:00Z"', value: 'match' }],
                'default'
            )
        ).toBe('match');
    });

    it('should treat different ISO date strings as not equal with loose inequality', () => {
        expect(
            conditional(
                [{ condition: '"2024-01-01T00:00:00Z" != "2024-01-02T00:00:00Z"', value: 'match' }],
                'default'
            )
        ).toBe('match');
    });

    it('should support CONTAINS on ISO date strings', () => {
        expect(
            conditional(
                [{ condition: '"2024-01-01T00:00:00Z" CONTAINS "2024-01-01"', value: 'match' }],
                'default'
            )
        ).toBe('match');
    });
});
