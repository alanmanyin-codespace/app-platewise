import { describe, it, expect } from 'vitest';
import { filter } from './filter';

describe('filter', () => {
    it('returns [] when list is not an array', () => {
        // @ts-expect-error intentionally wrong type
        expect(filter(null, () => true)).toEqual([]);
        expect(filter({} as any, () => true)).toEqual([]);
        expect(filter(undefined as any, true)).toEqual([]);
    });

    it('returns [] when iterator is falsy', () => {
        expect(filter([1, 2, 3], undefined as any)).toEqual([]);
        expect(filter([1, 2, 3], false)).toEqual([]);
        expect(filter([1, 2, 3], 0 as any)).toEqual([]);
        expect(filter([1, 2, 3], '' as any)).toEqual([]);
        expect(filter([1, 2, 3], null as any)).toEqual([]);
    });

    it('returns original list when iterator is the boolean true', () => {
        const list = [1, 2, 3];
        const result = filter(list, true);
        expect(result).toEqual(list);
    });

    it('returns [] when iterator is the boolean false', () => {
        expect(filter([1, 2, 3], false)).toEqual([]);
    });

    it('uses a synchronous function iterator to filter items', () => {
        const list = [10, 15, 20, 25];
        const result = filter(list, (item, index, arr) => {
            // verify callback args
            expect(arr).toBe(list);
            expect(arr[index]).toBe(item);
            return item < 20;
        });
        // should be a plain array, not a Promise
        expect(Array.isArray(result)).toBe(true);
        expect(result).toEqual([10, 15]);
    });

    it('handles an async function iterator (all promises) and resolves to filtered list', async () => {
        const list = [1, 2, 3, 4];
        const result = filter(list, async (item) => item % 2 === 0);
        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toEqual([2, 4]);
    });

    it('handles a mixed iterator (some promises, some booleans)', async () => {
        const list = ['a', 'bb', 'ccc', 'dddd'];
        const result = filter(list, (item, index) => {
            if (index % 2 === 0) {
                return Promise.resolve(item.length > 1); // a(false), ccc(true)
            }
            return item.length > 2; // bb(false), dddd(true)
        });
        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toEqual(['ccc', 'dddd']);
    });

    it('returns the original list when iterator is truthy but not a function/boolean', () => {
        const list = [1, 2, 3];
        const result = filter(list, 'truthy' as any);
        expect(result).toEqual(list);
    });

    it('works with empty list and async iterator (returns sync [] because no iteration happens)', () => {
        const list: number[] = [];
        const result = filter(list, async () => true);
        // No items means no promises detected; filter returns [] synchronously
        expect(result).toEqual([]);
    });
});
