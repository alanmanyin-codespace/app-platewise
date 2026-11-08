import type { Profile } from './types';
import type { ProfileWizardStep } from './profileWizard';

export type ProfileOptionField =
    | 'householdSize'
    | 'cuisines'
    | 'proteins'
    | 'dislikedIngredients'
    | 'allergies'
    | 'dietaryPreferences'
    | 'preferredStores';

const singleChoiceFields: ProfileOptionField[] = ['householdSize'];
/** Stores from the earlier Ontario list; they never appear in Calgary flyers. */
const RETIRED_STORES = new Set(['Metro', 'Food Basics']);
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

export function formatHouseholdSize(value: number): string {
    return value >= 4 ? '4+' : String(value);
}

export function parseHouseholdSize(value?: string): number | undefined {
    if (!value) return undefined;
    if (value === '4+') return 4;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/**
 * Answers to pre-select when editing. Fixed lists keep only options still shown;
 * lists from the API keep every saved value, so a store without a flyer this week
 * is not dropped.
 */
export function initialSelections(profile: Profile | null, steps: ProfileWizardStep[]): Record<ProfileOptionField, string[]> {
    const selections = { householdSize: [], cuisines: [], proteins: [], dislikedIngredients: [], allergies: [], dietaryPreferences: [], preferredStores: [] } as Record<ProfileOptionField, string[]>;
    if (!profile) return selections;
    selections.householdSize = profile.householdSize ? [formatHouseholdSize(profile.householdSize)] : [];
    for (const step of steps) {
        if (step.field === 'displayName' || step.field === 'householdSize') continue;
        const saved = profile[step.field];
        selections[step.field] = step.remoteOptions || step.kind === 'search'
            ? saved.filter((value) => step.field !== 'preferredStores' || !RETIRED_STORES.has(value))
            : saved.filter((value) => step.options?.includes(value));
    }
    return selections;
}

/** Saved answers the wizard no longer shows (e.g. "High protein") stay in the profile. */
export function keepHiddenValues(saved: string[], selected: string[], options: string[]): string[] {
    return [...saved.filter((value) => !options.includes(value)), ...selected];
}

type RemoteLists = { cuisines: string[]; proteins: { name: string }[]; stores: string[] };

/** Chips for a step: fixed options, or "No preference" plus the API list and any saved values not in it. */
export function optionsForStep(step: ProfileWizardStep, lists: RemoteLists, selected: string[]): string[] {
    if (!step.remoteOptions) return step.options ?? [];
    const remote = step.field === 'cuisines' ? lists.cuisines : step.field === 'proteins' ? lists.proteins.map((item) => item.name) : lists.stores;
    const options = ['No preference', ...remote.filter((value) => value !== 'No preference')];
    return [...options, ...selected.filter((value) => !options.includes(value))];
}
