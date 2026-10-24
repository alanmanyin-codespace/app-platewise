import { atom } from 'jotai';
import type { Profile, ProfileListField, ProfilePatch } from './types';

const listFields: ProfileListField[] = [
    'allergies',
    'dietaryPreferences',
    'mealPlanningPreferences',
    'preferredStores'
];

export const profileAtom = atom<Profile | null>(null);
export const profileHydratedAtom = atom(false);

export function createProfile(patch: ProfilePatch = {}, updatedAt = new Date().toISOString()): Profile {
    return {
        id: `anonymous-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        displayName: patch.displayName?.trim() ?? '',
        householdSize: patch.householdSize,
        savingsGoal: patch.savingsGoal?.trim(),
        allergies: patch.allergies ?? [],
        dietaryPreferences: patch.dietaryPreferences ?? [],
        mealPlanningPreferences: patch.mealPlanningPreferences ?? [],
        preferredStores: patch.preferredStores ?? [],
        onboardingComplete: patch.onboardingComplete ?? false,
        updatedAt
    };
}

export function applyProfilePatch(
    profile: Profile,
    patch: ProfilePatch,
    updatedAt = new Date().toISOString()
): Profile {
    return {
        ...profile,
        ...patch,
        displayName: patch.displayName === undefined ? profile.displayName : patch.displayName.trim(),
        savingsGoal:
            patch.savingsGoal === undefined ? profile.savingsGoal : patch.savingsGoal.trim(),
        updatedAt
    };
}

export function toggleProfileListValue(
    profile: Profile,
    field: ProfileListField,
    value: string,
    updatedAt = new Date().toISOString()
): Profile {
    const normalizedValue = value.trim();
    if (!normalizedValue) {
        return profile;
    }

    const values = profile[field];
    const nextValues = values.includes(normalizedValue)
        ? values.filter((item) => item !== normalizedValue)
        : [...values, normalizedValue];

    return { ...profile, [field]: nextValues, updatedAt };
}

export function parseStoredProfile(raw: string | null): Profile | null {
    if (!raw) {
        return null;
    }

    try {
        const value = JSON.parse(raw) as Partial<Profile>;
        if (
            typeof value.id !== 'string' ||
            typeof value.displayName !== 'string' ||
            typeof value.updatedAt !== 'string' ||
            typeof value.onboardingComplete !== 'boolean' ||
            !listFields.every((field) => Array.isArray(value[field]))
        ) {
            return null;
        }

        return value as Profile;
    } catch {
        return null;
    }
}
