import { describe, expect, it } from 'vitest';
import { getProfileCompletion, getProfileSummary } from './profileSelectors';
import type { Profile } from './types';

const baseProfile: Profile = {
    id: 'anonymous-1',
    displayName: 'Alex',
    householdSize: 3,
    savingsGoal: 'Lower my weekly bill',
    allergies: ['Peanuts'],
    dietaryPreferences: ['Vegetarian'],
    mealPlanningPreferences: ['The whole week'],
    preferredStores: ['Metro'],
    onboardingComplete: true,
    updatedAt: '2026-10-23T00:00:00.000Z'
};

describe('profile selectors', () => {
    it('returns an empty state when no profile exists', () => {
        expect(getProfileCompletion(null)).toBe(0);
        expect(getProfileSummary(null)).toEqual([]);
    });

    it('calculates partial completion from populated profile areas', () => {
        expect(
            getProfileCompletion({
                ...baseProfile,
                householdSize: undefined,
                preferredStores: []
            })
        ).toBe(71);
    });

    it('returns a complete profile summary', () => {
        expect(getProfileCompletion(baseProfile)).toBe(100);
        expect(getProfileSummary(baseProfile)).toEqual([
            'Alex',
            'Household: 3',
            'Savings goal: Lower my weekly bill',
            'Allergies: Peanuts',
            'Diet: Vegetarian',
            'Meal planning: The whole week',
            'Stores: Metro'
        ]);
    });
});
