import type { ProfileOptionField } from './profileSetup';

export type ProfileWizardField = 'displayName' | ProfileOptionField;

/**
 * Steps are grouped so a wide viewport can ask a themed set of questions per
 * screen instead of marching through seven near-empty ones. Narrow viewports
 * still take the steps one at a time.
 */
export type ProfileWizardGroupId = 'about' | 'enjoy' | 'avoid' | 'shopping';

export type ProfileWizardStep = {
    field: ProfileWizardField;
    group: ProfileWizardGroupId;
    /** name: free text; options: chips; dropdown: multi-select list; search: type to find ingredients from the API. */
    kind: 'name' | 'options' | 'dropdown' | 'search';
    label: string;
    description: string;
    options?: string[];
    multiSelect?: boolean;
    /** Options come from platewise-api at runtime; `options` holds only the fallback. */
    remoteOptions?: boolean;
};

export type ProfileWizardGroup = {
    id: ProfileWizardGroupId;
    label: string;
    description: string;
};

export const PROFILE_WIZARD_GROUPS: ProfileWizardGroup[] = [
    { id: 'about', label: 'About you', description: 'Sets how many servings we plan.' },
    { id: 'enjoy', label: 'What you enjoy', description: 'Recipes you like come first.' },
    { id: 'avoid', label: 'What to avoid', description: 'We keep these out of every recipe we suggest.' },
    { id: 'shopping', label: 'Where you shop', description: 'Which Calgary flyers we check first.' }
];

/** The name and disliked ingredients may be left blank. */
const OPTIONAL_FIELDS: ProfileWizardField[] = ['displayName', 'dislikedIngredients'];

export const PROFILE_WIZARD_STEPS: ProfileWizardStep[] = [
    { field: 'displayName', group: 'about', kind: 'name', label: 'Your name', description: 'What should we call you? Your name is optional.' },
    { field: 'householdSize', group: 'about', kind: 'options', label: 'Household size', description: 'How many people do you usually cook for?', options: ['1', '2', '3', '4+'] },
    { field: 'cuisines', group: 'enjoy', kind: 'dropdown', label: 'Cuisines you enjoy', description: 'Choose all that fit, or select no preference.', options: ['No preference'], multiSelect: true, remoteOptions: true },
    { field: 'proteins', group: 'enjoy', kind: 'dropdown', label: 'Preferred proteins', description: 'Choose all that fit, or select no preference.', options: ['No preference'], multiSelect: true, remoteOptions: true },
    { field: 'dislikedIngredients', group: 'avoid', kind: 'search', label: 'Ingredients you dislike', description: 'Search for ingredients to leave out. You can skip this.', multiSelect: true },
    { field: 'allergies', group: 'avoid', kind: 'dropdown', label: 'Allergies to avoid', description: 'We will keep these ingredients out of recipe suggestions.', options: ['None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Fish', 'Eggs', 'Soy', 'Sesame'], multiSelect: true },
    { field: 'dietaryPreferences', group: 'avoid', kind: 'dropdown', label: 'Diet', description: 'Choose all that fit, or select no preference.', options: ['No preference', 'Vegetarian', 'Vegan', 'Pescatarian', 'No pork', 'No beef'], multiSelect: true },
    { field: 'preferredStores', group: 'shopping', kind: 'dropdown', label: 'Preferred stores', description: 'Pick the Calgary stores you want us to prioritize.', options: ['No preference'], multiSelect: true, remoteOptions: true }
];

export function getInterviewSteps(creating: boolean): ProfileWizardStep[] {
    return creating ? PROFILE_WIZARD_STEPS.filter((step) => step.field !== 'displayName') : PROFILE_WIZARD_STEPS;
}

export function getNextWizardStep(index: number): number {
    return Math.min(index + 1, PROFILE_WIZARD_STEPS.length - 1);
}

export function getPreviousWizardStep(index: number): number {
    return Math.max(index - 1, 0);
}

export function getStepsInGroup(group: ProfileWizardGroupId): ProfileWizardStep[] {
    return PROFILE_WIZARD_STEPS.filter((step) => step.group === group);
}

/**
 * A step counts as answered when it carries at least one selection. The name
 * step is exempt, so a visitor can move past it without inventing one.
 */
export function isWizardStepAnswered(step: ProfileWizardStep, selectedValues: string[]): boolean {
    if (OPTIONAL_FIELDS.includes(step.field)) {
        return true;
    }
    return selectedValues.length > 0;
}

export function clampPageIndex(index: number, pageCount: number): number {
    if (pageCount <= 0) {
        return 0;
    }
    return Math.min(Math.max(index, 0), pageCount - 1);
}

/** Splits the steps into pages of `size` questions, in order (used on narrow screens). */
export function chunkSteps(steps: ProfileWizardStep[], size: number): ProfileWizardStep[][] {
    const pages: ProfileWizardStep[][] = [];
    for (let i = 0; i < steps.length; i += size) pages.push(steps.slice(i, i + size));
    return pages;
}
