import { createProfile } from './profileState';
import { getInterviewProfile } from './profileSetup';
import { describe, expect, it } from 'vitest';
import { applyProfileOption, initialSelections, keepHiddenValues, filterOptions, optionsForStep, selectionSummary } from './profileSetup';
import { PROFILE_WIZARD_STEPS } from './profileWizard';

describe('profile setup options', () => {
    it('keeps a single choice for household and savings goal', () => {
        expect(applyProfileOption('householdSize', ['2'], '4+')).toEqual(['4+']);
    });

    it('makes none and no preference exclusive', () => {
        expect(applyProfileOption('allergies', ['Dairy'], 'None')).toEqual(['None']);
        expect(applyProfileOption('dietaryPreferences', ['Vegetarian'], 'No preference')).toEqual([
            'No preference'
        ]);
        expect(applyProfileOption('allergies', ['None'], 'Peanuts')).toEqual(['Peanuts']);
    });

    it('toggles regular multi-select choices', () => {
        expect(applyProfileOption('preferredStores', ['Metro'], 'No Frills')).toEqual(['Metro', 'No Frills']);
        expect(applyProfileOption('preferredStores', ['Metro', 'No Frills'], 'Metro')).toEqual(['No Frills']);
    });
});

describe('starting profile setup', () => {
    it('starts a new interview without saved answers', () => {
        const old = createProfile({ displayName: 'Previous', allergies: ['Peanuts'] });
        expect(getInterviewProfile(old, 'create')).toBeNull();
    });
    it('loads saved answers when editing a profile', () => {
        const old = createProfile({ displayName: 'Existing' });
        expect(getInterviewProfile(old, 'edit')).toBe(old);
    });
});

describe('editing an existing profile', () => {
    const old = createProfile({ householdSize: 2, dietaryPreferences: ['High protein', 'Vegetarian'], preferredStores: ['Metro', 'Walmart', 'Food Basics'], cuisines: ['Thai'], dislikedIngredients: ['olive'] });

    it('pre-selects only answers the wizard still offers, keeping saved D1 choices', () => {
        const selected = initialSelections(old, PROFILE_WIZARD_STEPS);
        expect(selected.householdSize).toEqual(['2']);
        expect(selected.dietaryPreferences).toEqual(['Vegetarian']);
        expect(selected.preferredStores).toEqual(['Walmart']);
        expect(selected.cuisines).toEqual(['Thai']);
        expect(selected.dislikedIngredients).toEqual(['olive']);
    });

    it('keeps hidden diet answers when saving', () => {
        expect(keepHiddenValues(old.dietaryPreferences, ['Vegan'], PROFILE_WIZARD_STEPS.find((step) => step.field === 'dietaryPreferences')!.options!)).toEqual(['High protein', 'Vegan']);
    });

    it('starts empty for a new profile', () => {
        expect(initialSelections(null, PROFILE_WIZARD_STEPS).preferredStores).toEqual([]);
    });
});

describe('options shown for each step', () => {
    const lists = { cuisines: ['Italian', 'Thai'], proteins: [{ name: 'Chicken', categories: ['Chicken'] }], stores: ['Walmart', 'Sobeys'] };
    const step = (field: string) => PROFILE_WIZARD_STEPS.find((item) => item.field === field)!;
    it('fills API-backed steps after "No preference"', () => {
        expect(optionsForStep(step('cuisines'), lists, [])).toEqual(['No preference', 'Italian', 'Thai']);
        expect(optionsForStep(step('proteins'), lists, [])).toEqual(['No preference', 'Chicken']);
    });
    it('keeps a saved store that has no flyer this week', () => {
        expect(optionsForStep(step('preferredStores'), lists, ['Calgary Co-op'])).toEqual(['No preference', 'Walmart', 'Sobeys', 'Calgary Co-op']);
    });
    it('falls back to "No preference" when the lists are unavailable, and leaves fixed lists alone', () => {
        const none = { cuisines: [], proteins: [], stores: [] };
        expect(optionsForStep(step('preferredStores'), none, [])).toEqual(['No preference']);
        expect(optionsForStep(step('allergies'), lists, [])).toEqual(step('allergies').options);
    });
});

describe('dropdown summary', () => {
    it('describes the current selection in one line', () => {
        expect(selectionSummary([], 'Choose cuisines')).toBe('Choose cuisines');
        expect(selectionSummary(['No preference'], 'Choose cuisines')).toBe('No preference');
        expect(selectionSummary(['Italian', 'Thai'], 'Choose cuisines')).toBe('Italian, Thai');
        expect(selectionSummary(['Italian', 'Thai', 'Greek', 'Mexican'], 'Choose cuisines')).toBe('Italian, Thai +2 more');
    });
});

describe('dropdown search', () => {
    const options = ['No preference', 'Italian', 'Thai', 'Tunisian', 'British'];
    it('keeps every option for an empty query', () => {
        expect(filterOptions(options, ' ')).toEqual(options);
    });
    it('matches case-insensitively, names starting with the text first', () => {
        expect(filterOptions(options, 'T')).toEqual(['Thai', 'Tunisian', 'Italian', 'British']);
        expect(filterOptions(options, 'ital')).toEqual(['Italian']);
        expect(filterOptions(options, 'xyz')).toEqual([]);
    });
});
