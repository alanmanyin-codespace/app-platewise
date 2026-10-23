import { describe, expect, it } from 'vitest';
import { join } from './join';

describe('join', () => {
    describe('separator type', () => {
        it('should join array with no separator', () => {
            expect(join(['apple', 'banana', 'cherry'], { type: 'separator' })).toBe(
                'applebananacherry'
            );
        });

        it('should join array with custom separator', () => {
            expect(
                join(['apple', 'banana', 'cherry'], { type: 'separator', separator: ' | ' })
            ).toBe('apple | banana | cherry');
        });

        it('should join array with empty separator', () => {
            expect(join(['a', 'b', 'c'], { type: 'separator', separator: '' })).toBe('abc');
        });

        it('should join numbers', () => {
            expect(join([1, 2, 3], { type: 'separator', separator: '-' })).toBe('1-2-3');
        });

        it('should join mixed types', () => {
            expect(join([1, 'two', true, null], { type: 'separator', separator: ', ' })).toBe(
                '1, two, true, '
            );
        });

        it('should explicitly use separator type', () => {
            expect(join(['a', 'b', 'c'], { type: 'separator', separator: '; ' })).toBe('a; b; c');
        });
    });

    describe('conjunction type', () => {
        it('should format with conjunction (long style)', () => {
            const result = join(['apple', 'banana', 'cherry'], {
                type: 'conjunction',
                style: 'long'
            });
            expect(result).toBe('apple, banana, and cherry');
        });

        it('should format with conjunction (short style)', () => {
            const result = join(['apple', 'banana', 'cherry'], {
                type: 'conjunction',
                style: 'short'
            });
            expect(result).toBe('apple, banana, & cherry');
        });

        it('should format with conjunction (narrow style)', () => {
            const result = join(['apple', 'banana', 'cherry'], {
                type: 'conjunction',
                style: 'narrow'
            });
            expect(result).toBe('apple, banana, cherry');
        });

        it('should format two items with conjunction', () => {
            const result = join(['apple', 'banana'], { type: 'conjunction' });
            expect(result).toBe('apple and banana');
        });

        it('should format single item with conjunction', () => {
            const result = join(['apple'], { type: 'conjunction' });
            expect(result).toBe('apple');
        });
    });

    describe('disjunction type', () => {
        it('should format with disjunction (long style)', () => {
            const result = join(['apple', 'banana', 'cherry'], {
                type: 'disjunction',
                style: 'long'
            });
            expect(result).toBe('apple, banana, or cherry');
        });

        it('should format with disjunction (short style)', () => {
            const result = join(['apple', 'banana', 'cherry'], {
                type: 'disjunction',
                style: 'short'
            });
            expect(result).toBe('apple, banana, or cherry');
        });

        it('should format two items with disjunction', () => {
            const result = join(['apple', 'banana'], { type: 'disjunction' });
            expect(result).toBe('apple or banana');
        });
    });

    describe('unit type', () => {
        it('should format with unit (long style)', () => {
            const result = join(['5', 'miles'], { type: 'unit', style: 'long' });
            expect(result).toBe('5, miles');
        });

        it('should format with unit (short style)', () => {
            const result = join(['5', 'mi'], { type: 'unit', style: 'short' });
            expect(result).toBe('5, mi');
        });

        it('should format with unit (narrow style)', () => {
            const result = join(['5', 'mi'], { type: 'unit', style: 'narrow' });
            expect(result).toBe('5 mi');
        });
    });

    describe('edge cases', () => {
        it('should return empty string for undefined', () => {
            expect(join(undefined)).toBe('');
        });

        it('should return empty string for null', () => {
            expect(join(null as any)).toBe('');
        });

        it('should return empty string for empty array', () => {
            expect(join([])).toBe('');
        });

        it('should return empty string for non-array', () => {
            expect(join('not an array' as any)).toBe('');
        });

        it('should handle single element array', () => {
            expect(join(['only'])).toBe('only');
        });

        it('should convert null and undefined items to empty strings', () => {
            expect(join([null, undefined, 'value'], { type: 'separator', separator: '-' })).toBe(
                '--value'
            );
        });

        it('should handle objects by converting to string', () => {
            expect(join([{ name: 'test' }], { type: 'separator', separator: ', ' })).toBe(
                '[object Object]'
            );
        });

        it('should handle boolean values', () => {
            expect(join([true, false], { type: 'separator', separator: ', ' })).toBe('true, false');
        });
    });

    describe('default style behavior', () => {
        it('should default to long style for conjunction', () => {
            const result = join(['a', 'b', 'c'], { type: 'conjunction' });
            expect(result).toBe('a, b, and c');
        });

        it('should default to long style for disjunction', () => {
            const result = join(['a', 'b', 'c'], { type: 'disjunction' });
            expect(result).toBe('a, b, or c');
        });
    });
});
