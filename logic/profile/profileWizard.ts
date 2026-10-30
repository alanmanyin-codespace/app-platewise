import type { ProfileOptionField } from './profileSetup';

export type ProfileWizardField = 'displayName' | ProfileOptionField;

/**
 * Steps are grouped so a wide viewport can ask a themed set of questions per
 * screen instead of marching through seven near-empty ones. Narrow viewports
 * still take the steps one at a time.
 */
export type ProfileWizardGroupId = 'about' | 'food' | 'shopping';

export type ProfileWizardStep = {
    field: ProfileWizardField;
    group: ProfileWizardGroupId;
    label: string;
    description: string;
    options?: string[];
    multiSelect?: boolean;
};

export type ProfileWizardGroup = {
    id: ProfileWizardGroupId;
    label: string;
    description: string;
};

export const PROFILE_WIZARD_GROUPS: ProfileWizardGroup[] = [
    {
        id: 'about',
        label: 'About you',
        description: 'Sets how many servings we plan and what the savings aim at.'
    },
    {
        id: 'food',
        label: 'What you eat',
        description: 'We keep allergens out of every recipe we suggest.'
    },
    {
        id: 'shopping',
        label: 'How you shop',
        description: 'Which flyers we read, and how far ahead we plan.'
    }
];

/** Only the name may be left blank; its own copy already calls it optional. */
const OPTIONAL_FIELDS: ProfileWizardField[] = ['displayName'];

export const PROFILE_WIZARD_STEPS: ProfileWizardStep[] = [
    { field: 'displayName', group: 'about', label: 'Your name', description: 'What should we call you? Your name is optional.' },
    { field: 'householdSize', group: 'about', label: 'Household size', description: 'How many people do you usually shop for?', options: ['1', '2', '3', '4+'] },
    { field: 'savingsGoal', group: 'about', label: 'Savings goal', description: 'What would make your grocery trips better?', options: ['Lower my weekly bill', 'Find more flyer deals', 'Plan within a budget'] },
    { field: 'allergies', group: 'food', label: 'Allergies to avoid', description: 'We will keep these ingredients out of recipe suggestions.', options: ['None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'], multiSelect: true },
    { field: 'dietaryPreferences', group: 'food', label: 'Dietary preferences', description: 'Choose all that fit, or select no preference.', options: ['No preference', 'Vegetarian', 'High protein', 'Low carb'], multiSelect: true },
    { field: 'mealPlanningPreferences', group: 'shopping', label: 'Meal planning', description: 'What kind of planning support would help most?', options: ['A few dinners', 'The whole week', 'Quick meals', 'Batch cooking'], multiSelect: true },
    { field: 'preferredStores', group: 'shopping', label: 'Preferred stores', description: 'Pick the stores you want us to prioritize.', options: ['Metro', 'No Frills', 'FreshCo', 'Walmart', 'Food Basics'], multiSelect: true }
];

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
