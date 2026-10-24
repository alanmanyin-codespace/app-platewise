import { describe, expect, it } from 'vitest';
import { applyProfileOption } from './profileSetup';

describe('profile setup options', () => {
    it('keeps a single choice for household and savings goal', () => {
        expect(applyProfileOption('householdSize', ['2'], '4+')).toEqual(['4+']);
        expect(applyProfileOption('savingsGoal', ['Lower my weekly bill'], 'Plan within a budget')).toEqual([
            'Plan within a budget'
        ]);
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
