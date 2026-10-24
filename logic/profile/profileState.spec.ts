import { describe, expect, it } from 'vitest';
import {
    applyProfilePatch,
    createProfile,
    parseStoredProfile,
    toggleProfileListValue
} from './profileState';

describe('profile state', () => {
    it('creates a profile from the first meaningful answer', () => {
        const profile = createProfile({ displayName: ' Alex ' }, '2026-10-23T00:00:00.000Z');

        expect(profile.displayName).toBe('Alex');
        expect(profile.id).toMatch(/^anonymous-/);
        expect(profile.onboardingComplete).toBe(false);
        expect(profile.updatedAt).toBe('2026-10-23T00:00:00.000Z');
    });

    it('ignores whitespace-only display names', () => {
        const profile = createProfile({ displayName: '   ' }, '2026-10-23T00:00:00.000Z');

        expect(profile.displayName).toBe('');
    });

    it('applies a partial update without replacing existing preferences', () => {
        const profile = createProfile(
            { displayName: 'Alex', allergies: ['Peanuts'] },
            '2026-10-23T00:00:00.000Z'
        );
        const updated = applyProfilePatch(
            profile,
            { householdSize: 3, preferredStores: ['Metro'] },
            '2026-10-23T01:00:00.000Z'
        );

        expect(updated.displayName).toBe('Alex');
        expect(updated.allergies).toEqual(['Peanuts']);
        expect(updated.householdSize).toBe(3);
        expect(updated.updatedAt).toBe('2026-10-23T01:00:00.000Z');
    });

    it('toggles a value in a profile preference list without duplicates', () => {
        const profile = createProfile({ allergies: ['Peanuts'] }, '2026-10-23T00:00:00.000Z');
        const added = toggleProfileListValue(profile, 'allergies', 'Dairy', '2026-10-23T01:00:00.000Z');
        const removed = toggleProfileListValue(added, 'allergies', 'Peanuts', '2026-10-23T02:00:00.000Z');

        expect(added.allergies).toEqual(['Peanuts', 'Dairy']);
        expect(removed.allergies).toEqual(['Dairy']);
    });

    it('recovers from malformed stored profile data', () => {
        expect(parseStoredProfile('{not-json}')).toBeNull();
        expect(parseStoredProfile(JSON.stringify({ displayName: 'Missing fields' }))).toBeNull();
    });
});
