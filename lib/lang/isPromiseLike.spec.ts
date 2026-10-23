import { describe, it, expect } from 'vitest';
import { isPromiseLike } from './isPromiseLike';

describe('isPromiseLike', () => {
    it('returns true for a real Promise', () => {
        const p = Promise.resolve(42);
        expect(isPromiseLike(p)).toBe(true);
    });

    it('returns true for a thenable object', () => {
        // biome-ignore lint/suspicious/noThenProperty: tests
        const thenable = { then: (_resolve: (v: unknown) => void) => {} };
        expect(isPromiseLike(thenable)).toBe(true);
    });

    it('returns false for non-thenable primitives and objects', () => {
        expect(isPromiseLike(null)).toBe(false);
        expect(isPromiseLike(undefined)).toBe(false);
        expect(isPromiseLike(0)).toBe(false);
        expect(isPromiseLike('')).toBe(false);
        expect(isPromiseLike(true)).toBe(false);
        expect(isPromiseLike({})).toBe(false);
        expect(isPromiseLike(() => {})).toBe(false);
    });

    it('returns false when "then" exists but is not a function', () => {
        // biome-ignore lint/suspicious/noThenProperty: tests
        const obj = { then: 'not-a-function' };
        expect(isPromiseLike(obj)).toBe(false);
    });

    it('returns true for the result of an async function (a Promise)', () => {
        async function asyncFn() {
            return 1;
        }
        const result = asyncFn();
        expect(isPromiseLike(result)).toBe(true);
    });

    it('propagates errors thrown by a throwing then getter', () => {
        const obj = Object.create(null);
        Object.defineProperty(obj, 'then', {
            get() {
                throw new Error('getter failed');
            }
        });
        expect(() => isPromiseLike(obj as any)).toThrowError('getter failed');
    });
});
