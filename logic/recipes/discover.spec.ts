import { describe, expect, it } from 'vitest';
import { filterRecipes } from './discover';
import { sampleRecipes } from './sampleRecipes';

describe('meal discovery', () => {
    it('shows the full sample catalog without a profile', () => {
        expect(filterRecipes(sampleRecipes, { store: 'All stores', maxMinutes: null, excludedAllergens: [] })).toHaveLength(sampleRecipes.length);
    });
    it('filters by store and maximum preparation time together', () => {
        const result = filterRecipes(sampleRecipes, { store: 'FreshCo', maxMinutes: 30, excludedAllergens: [] });
        expect(result.map((recipe) => recipe.id)).toEqual(['r3']);
    });
    it('respects existing allergy selections', () => {
        const result = filterRecipes(sampleRecipes, { store: 'All stores', maxMinutes: null, excludedAllergens: ['Fish'] });
        expect(result.map((recipe) => recipe.id)).not.toContain('r1');
    });
});
