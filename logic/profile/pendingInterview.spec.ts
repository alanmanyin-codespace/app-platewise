import { describe, expect, it } from 'vitest';
import { clearPendingInterview, getPendingInterview, savePendingInterview } from './pendingInterview';

describe('pending interview', () => {
    it('keeps submitted answers through a redirect until explicitly cleared', () => {
        const values = new Map<string, string>();
        const storage = { getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => { values.set(key, value); }, removeItem: (key: string) => { values.delete(key); } };
        const answers = { displayName: 'Alex', allergies: ['Peanuts'], onboardingComplete: true };
        savePendingInterview(answers, storage);
        expect(getPendingInterview(storage)).toEqual(answers);
        expect(getPendingInterview(storage)).toEqual(answers);
        clearPendingInterview(storage);
        expect(getPendingInterview(storage)).toBeNull();
    });
    it('ignores malformed drafts', () => {
        const storage = { getItem: () => '{broken', setItem: () => {}, removeItem: () => {} };
        expect(getPendingInterview(storage)).toBeNull();
    });
});
