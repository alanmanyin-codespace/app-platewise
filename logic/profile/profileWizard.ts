import type { ProfileOptionField } from './profileSetup';

export type ProfileWizardField = 'displayName' | ProfileOptionField;

export type ProfileWizardStep = {
    field: ProfileWizardField;
    label: string;
    description: string;
    options?: string[];
    multiSelect?: boolean;
};

export const PROFILE_WIZARD_STEPS: ProfileWizardStep[] = [
    { field: 'displayName', label: 'Your name', description: 'What should we call you? Your name is optional.' },
    { field: 'householdSize', label: 'Household size', description: 'How many people do you usually shop for?', options: ['1', '2', '3', '4+'] },
    { field: 'savingsGoal', label: 'Savings goal', description: 'What would make your grocery trips better?', options: ['Lower my weekly bill', 'Find more flyer deals', 'Plan within a budget'] },
    { field: 'allergies', label: 'Allergies to avoid', description: 'We will keep these ingredients out of recipe suggestions.', options: ['None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'], multiSelect: true },
    { field: 'dietaryPreferences', label: 'Dietary preferences', description: 'Choose all that fit, or select no preference.', options: ['No preference', 'Vegetarian', 'High protein', 'Low carb'], multiSelect: true },
    { field: 'mealPlanningPreferences', label: 'Meal planning', description: 'What kind of planning support would help most?', options: ['A few dinners', 'The whole week', 'Quick meals', 'Batch cooking'], multiSelect: true },
    { field: 'preferredStores', label: 'Preferred stores', description: 'Pick the stores you want us to prioritize.', options: ['Metro', 'No Frills', 'FreshCo', 'Walmart', 'Food Basics'], multiSelect: true }
];

export function getNextWizardStep(index: number): number {
    return Math.min(index + 1, PROFILE_WIZARD_STEPS.length - 1);
}

export function getPreviousWizardStep(index: number): number {
    return Math.max(index - 1, 0);
}
