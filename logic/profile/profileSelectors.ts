import type { Profile } from './types';

const profileAreas = (profile: Profile): boolean[] => [
    Boolean(profile.displayName.trim()),
    Boolean(profile.householdSize && profile.householdSize > 0),
    Boolean(profile.savingsGoal?.trim()),
    profile.allergies.length > 0,
    profile.dietaryPreferences.length > 0,
    profile.mealPlanningPreferences.length > 0,
    profile.preferredStores.length > 0
];

export function getProfileCompletion(profile: Profile | null): number {
    if (!profile) {
        return 0;
    }

    return Math.round((profileAreas(profile).filter(Boolean).length / profileAreas(profile).length) * 100);
}

export function getProfileSummary(profile: Profile | null): string[] {
    if (!profile) {
        return [];
    }

    return [
        profile.displayName,
        profile.householdSize ? `Household: ${profile.householdSize}` : '',
        profile.savingsGoal ? `Savings goal: ${profile.savingsGoal}` : '',
        profile.allergies.length ? `Allergies: ${profile.allergies.join(', ')}` : '',
        profile.dietaryPreferences.length ? `Diet: ${profile.dietaryPreferences.join(', ')}` : '',
        profile.mealPlanningPreferences.length
            ? `Meal planning: ${profile.mealPlanningPreferences.join(', ')}`
            : '',
        profile.preferredStores.length ? `Stores: ${profile.preferredStores.join(', ')}` : ''
    ].filter(Boolean);
}
