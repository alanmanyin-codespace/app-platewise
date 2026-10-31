import type { Profile } from './types';

export type ProfileOptionField =
    | 'householdSize'
    | 'savingsGoal'
    | 'allergies'
    | 'dietaryPreferences'
    | 'mealPlanningPreferences'
    | 'preferredStores';

const singleChoiceFields: ProfileOptionField[] = ['householdSize', 'savingsGoal'];
const exclusiveOptions = new Set(['None', 'No preference']);

export function applyProfileOption(
    field: ProfileOptionField,
    selected: string[],
    option: string
): string[] {
    if (singleChoiceFields.includes(field)) {
        return [option];
    }

    if (exclusiveOptions.has(option)) {
        return selected.includes(option) ? [] : [option];
    }

    return selected.includes(option)
        ? selected.filter((value) => value !== option)
        : [...selected.filter((value) => !exclusiveOptions.has(value)), option];
}

/** New interviews start empty; editing is the only mode that pre-fills answers. */
export function getInterviewProfile(profile: Profile | null, mode?: string): Profile | null {
    return mode === 'edit' ? profile : null;
}
