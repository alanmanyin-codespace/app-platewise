import { describe, expect, it } from 'vitest';
import { classifyProfileAccess, isInvalidAuthResponse } from './profileAccess';

describe('profile access', () => {
    it('redirects when no session exists', () => {
        expect(classifyProfileAccess({ ready: true, sessionUserId: null })).toBe('denied');
    });
    it('waits for authentication to finish before deciding', () => {
        expect(classifyProfileAccess({ ready: false, sessionUserId: null })).toBe('loading');
    });
    it('accepts a verified matching user', () => {
        expect(classifyProfileAccess({ ready: true, sessionUserId: 'a', verifiedUserId: 'a' })).toBe('allowed');
    });
    it('rejects a deleted, invalid, or mismatched user', () => {
        expect(classifyProfileAccess({ ready: true, sessionUserId: 'a', invalid: true })).toBe('denied');
        expect(classifyProfileAccess({ ready: true, sessionUserId: 'a', verifiedUserId: 'b' })).toBe('denied');
    });
    it('does not mistake a network failure for an invalid account', () => {
        expect(classifyProfileAccess({ ready: true, sessionUserId: 'a', unavailable: true })).toBe('unavailable');
    });
    it('recognizes an invalid session without treating service failures as invalid', () => {
        expect(isInvalidAuthResponse({ code: 'session_not_found', status: 400 })).toBe(true);
        expect(isInvalidAuthResponse({ code: 'user_not_found', status: 404 })).toBe(true);
        expect(isInvalidAuthResponse({ status: 503 })).toBe(false);
    });
});
