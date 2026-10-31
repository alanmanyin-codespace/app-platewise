import { describe, expect, it } from 'vitest';
import { markProfileReturn, takeProfileReturn } from './signInReturn';

describe('sign-in return destination', () => {
    it('remembers a profile return until a signed-in session is ready', () => {
        const values = new Map<string, string>();
        const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
        markProfileReturn(storage);
        expect(takeProfileReturn(storage, false)).toBe(false);
        expect(takeProfileReturn(storage, true)).toBe(true);
        expect(takeProfileReturn(storage, true)).toBe(false);
    });
});
