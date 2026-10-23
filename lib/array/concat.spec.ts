import { describe, it, expect } from 'vitest';
import { concat } from './concat';

describe('concat', () => {
    it('should concat two arrays', () => {
        expect(concat([1, 2], [3, 4])).toEqual([1, 2, 3, 4]);
    });

    it('should concat an array and a non-array value', () => {
        expect(concat([1, 2], 3)).toEqual([1, 2, 3]);
    });

    it('should concat multiple arguments of mixed types', () => {
        expect(concat([1], 2, [3], '4', { a: 5 })).toEqual([1, 2, 3, '4', { a: 5 }]);
    });

    it('should handle nested arrays by flattening only one level', () => {
        expect(concat([1, [2]], [[3], 4])).toEqual([1, [2], [3], 4]);
    });

    it('should return an empty array when no arguments are provided', () => {
        expect(concat()).toEqual([]);
    });

    it('should handle null and undefined arguments as single items', () => {
        expect(concat(null, undefined, [1])).toEqual([null, undefined, 1]);
    });

    it('should return a new array and not mutate the input arrays', () => {
        const arr1 = [1, 2];
        const arr2 = [3, 4];
        const result = concat(arr1, arr2);
        expect(result).toEqual([1, 2, 3, 4]);
        expect(result).not.toBe(arr1);
        expect(result).not.toBe(arr2);
        expect(arr1).toEqual([1, 2]);
        expect(arr2).toEqual([3, 4]);
    });

    it('should handle only non-array arguments', () => {
        expect(concat(1, 2, 3)).toEqual([1, 2, 3]);
    });

    it('should handle empty arrays', () => {
        expect(concat([], [1], [])).toEqual([1]);
    });
});
