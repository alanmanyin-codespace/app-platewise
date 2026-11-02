import { describe, expect, it } from 'vitest';
import { accountOwnsProfile, profileFromAccount } from './accountProfile';

describe('account profile', () => {
    it('creates a new profile owned by the authenticated account', () => {
        const profile = profileFromAccount({ id: 'account-a', displayName: ' Ada ' }, '2026-01-01T00:00:00.000Z');
        expect(profile).toMatchObject({ id: 'account-a', displayName: 'Ada', onboardingComplete: false, allergies: [], dietaryPreferences: [] });
    });
    it('only permits an account to save its own profile', () => {
        const profile = profileFromAccount({ id: 'account-a' });
        expect(accountOwnsProfile(profile, 'account-a')).toBe(true);
        expect(accountOwnsProfile(profile, 'account-b')).toBe(false);
    });
});
