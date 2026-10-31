import { describe, expect, it } from 'vitest';
import {
    clampPageIndex,
    getInterviewSteps,
    getNextWizardStep,
    getPreviousWizardStep,
    getStepsInGroup,
    isWizardStepAnswered,
    PROFILE_WIZARD_GROUPS,
    PROFILE_WIZARD_STEPS
} from './profileWizard';

describe('profile wizard steps', () => {
    it('presents one profile topic at a time in a stable order', () => {
        expect(getInterviewSteps(true).map((step) => step.field)).toEqual([
            'householdSize',
            'savingsGoal',
            'allergies',
            'dietaryPreferences',
            'mealPlanningPreferences',
            'preferredStores'
        ]);
    });

    it('retains the name field when editing', () => {
        expect(getInterviewSteps(false).some((step) => step.field === 'displayName')).toBe(true);
    });

    it('moves forward and backward without leaving the wizard bounds', () => {
        expect(getNextWizardStep(0)).toBe(1);
        expect(getPreviousWizardStep(1)).toBe(0);
        expect(getNextWizardStep(PROFILE_WIZARD_STEPS.length - 1)).toBe(PROFILE_WIZARD_STEPS.length - 1);
        expect(getPreviousWizardStep(0)).toBe(0);
    });
});

describe('profile wizard groups', () => {
    it('assigns every step to a declared group', () => {
        const groupIds = PROFILE_WIZARD_GROUPS.map((group) => group.id);
        for (const step of PROFILE_WIZARD_STEPS) {
            expect(groupIds).toContain(step.group);
        }
    });

    it('covers all steps across the groups without losing or repeating any', () => {
        const grouped = PROFILE_WIZARD_GROUPS.flatMap((group) => getStepsInGroup(group.id));
        expect(grouped.map((step) => step.field)).toEqual(PROFILE_WIZARD_STEPS.map((step) => step.field));
    });

    it('keeps each group small enough to fit one screen', () => {
        for (const group of PROFILE_WIZARD_GROUPS) {
            const steps = getStepsInGroup(group.id);
            expect(steps.length).toBeGreaterThan(0);
            expect(steps.length).toBeLessThanOrEqual(3);
        }
    });
});

describe('wizard step completion', () => {
    it('requires a selection on the household step', () => {
        const householdStep = getInterviewSteps(true)[0];
        expect(isWizardStepAnswered(householdStep, [])).toBe(false);
        expect(isWizardStepAnswered(householdStep, ['2'])).toBe(true);
    });
});

describe('page index clamping', () => {
    it('keeps the index inside the available pages', () => {
        expect(clampPageIndex(5, 3)).toBe(2);
        expect(clampPageIndex(-1, 3)).toBe(0);
        expect(clampPageIndex(1, 3)).toBe(1);
    });

    it('falls back to the first page when there are none', () => {
        expect(clampPageIndex(2, 0)).toBe(0);
    });
});
