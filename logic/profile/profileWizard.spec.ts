import { describe, expect, it } from 'vitest';
import { getNextWizardStep, getPreviousWizardStep, PROFILE_WIZARD_STEPS } from './profileWizard';

describe('profile wizard steps', () => {
    it('presents one profile topic at a time in a stable order', () => {
        expect(PROFILE_WIZARD_STEPS.map((step) => step.field)).toEqual([
            'displayName',
            'householdSize',
            'savingsGoal',
            'allergies',
            'dietaryPreferences',
            'mealPlanningPreferences',
            'preferredStores'
        ]);
    });

    it('moves forward and backward without leaving the wizard bounds', () => {
        expect(getNextWizardStep(0)).toBe(1);
        expect(getPreviousWizardStep(1)).toBe(0);
        expect(getNextWizardStep(PROFILE_WIZARD_STEPS.length - 1)).toBe(PROFILE_WIZARD_STEPS.length - 1);
        expect(getPreviousWizardStep(0)).toBe(0);
    });
});
