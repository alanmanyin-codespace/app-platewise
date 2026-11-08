import type { Profile } from './types';

// Savings goal and meal planning are hidden from the interview, so they no longer count.
const profileAreas = (profile: Profile): boolean[] => [
    Boolean(profile.householdSize && profile.householdSize > 0),
    profile.cuisines.length > 0,
    profile.proteins.length > 0,
    profile.dislikedIngredients.length > 0,
    profile.allergies.length > 0,
    profile.dietaryPreferences.length > 0,
    profile.preferredStores.length > 0
];

export function getProfileCompletion(profile: Profile | null): number {
    if (!profile) {
        return 0;
    }

    const areas = profileAreas(profile);
    return Math.round((areas.filter(Boolean).length / areas.length) * 100);
}

export function getProfileSummary(profile: Profile | null): string[] {
    if (!profile) {
        return [];
    }

    const list = (label: string, values: string[]) => (values.length ? `${label}: ${values.join(', ')}` : '');
    return [
        profile.displayName,
        profile.householdSize ? `Household: ${profile.householdSize}` : '',
        list('Cuisines', profile.cuisines),
        list('Proteins', profile.proteins),
        list('Avoids', profile.dislikedIngredients),
        list('Allergies', profile.allergies),
        list('Diet', profile.dietaryPreferences),
        list('Stores', profile.preferredStores)
    ].filter(Boolean);
}
