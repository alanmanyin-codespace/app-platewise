import { describe, it, expect } from 'vitest';
import { find } from './find';

describe('find', () => {
    it('returns undefined when list is not an array', () => {
        // @ts-expect-error intentionally wrong type
        expect(find(null, () => true)).toBeUndefined();
        expect(find({} as any, () => true)).toBeUndefined();
        expect(find(undefined as any, true)).toBeUndefined();
    });

    it('returns undefined when iterator is falsy', () => {
        expect(find([1, 2, 3], undefined as any)).toBeUndefined();
        expect(find([1, 2, 3], false)).toBeUndefined();
        expect(find([1, 2, 3], 0 as any)).toBeUndefined();
        expect(find([1, 2, 3], '' as any)).toBeUndefined();
        expect(find([1, 2, 3], null as any)).toBeUndefined();
    });

    it('returns first item when iterator is the boolean true', () => {
        const list = [1, 2, 3];
        const result = find(list, true);
        expect(result).toBe(1);
    });

    it('returns undefined when iterator is the boolean false', () => {
        expect(find([1, 2, 3], false)).toBeUndefined();
    });

    it('uses a synchronous function iterator to find first matching item', () => {
        const list = [10, 15, 20, 25];
        const result = find(list, (item, index, arr) => {
            // verify callback args
            expect(arr).toBe(list);
            expect(arr[index]).toBe(item);
            return item >= 20;
        });
        // should be a plain value, not a Promise
        expect(result).toBe(20);
    });

    it('returns undefined when no item matches', () => {
        const list = [1, 2, 3, 4];
        const result = find(list, (item) => item > 10);
        expect(result).toBeUndefined();
    });

    it('handles an async function iterator and resolves to first matching item', async () => {
        const list = [1, 2, 3, 4];
        const result = find(list, async (item) => item % 2 === 0);
        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBe(2);
    });

    it('handles an async function iterator and resolves to undefined when no match', async () => {
        const list = [1, 3, 5, 7];
        const result = find(list, async (item) => item % 2 === 0);
        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBeUndefined();
    });

    it('handles a mixed iterator (some promises, some booleans)', async () => {
        const list = ['a', 'bb', 'ccc', 'dddd'];
        const result = find(list, (item, index) => {
            if (index % 2 === 0) {
                return Promise.resolve(item.length > 2); // a(false), ccc(true)
            }
            return item.length > 1; // bb(true), dddd(true)
        });
        expect(result).toBeInstanceOf(Promise);
        await expect(result).resolves.toBe('bb');
    });

    it('returns first item when iterator is truthy but not a function/boolean', () => {
        const list = [1, 2, 3];
        const result = find(list, 'truthy' as any);
        expect(result).toBe(1);
    });

    it('works with empty list and async iterator (returns sync undefined)', () => {
        const list: number[] = [];
        const result = find(list, async () => true);
        // No items means no promises detected; find returns undefined synchronously
        expect(result).toBeUndefined();
    });
});
