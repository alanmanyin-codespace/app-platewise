import { describe, expect, it } from 'vitest';
import { createProfile } from '../profile/profileState';
import type { ProfilePatch } from '../profile/types';
import { ingredientTags } from './ingredientTags';
import { matchRecipes, type MatchableRecipe } from './profileMatch';

const proteins = [
    { name: 'Beef', categories: ['Beef'] }, { name: 'Chicken', categories: ['Chicken'] },
    { name: 'Seafood', categories: ['Seafood'] }, { name: 'Plant-based', categories: ['Vegetarian', 'Vegan'] }
];
const recipe = (id: string, ingredientKeys: string[], area: string | null = 'British', category: string | null = 'Side'): MatchableRecipe => ({ id, area, category, ingredientKeys });
const ids = (recipes: MatchableRecipe[], patch: ProfilePatch) => matchRecipes(recipes, createProfile(patch), proteins).map((item) => item.id);

describe('ingredient tags', () => {
    it('recognises allergens in ingredient variants', () => {
        for (const key of ['butter', 'unsalted butter', 'cheddar cheese', 'milk']) expect(ingredientTags(key).allergens).toContain('Dairy');
        for (const key of ['plain flour', 'spaghetti']) expect(ingredientTags(key).allergens).toContain('Gluten');
        expect(ingredientTags('prawn').allergens).toContain('Shellfish');
        expect(ingredientTags('salmon').allergens).toContain('Fish');
        expect(ingredientTags('peanut butter').allergens).toEqual(['Peanuts']);
        expect(ingredientTags('coconut milk').allergens).not.toContain('Dairy');
        expect(ingredientTags('carrot').allergens).toEqual([]);
        expect(ingredientTags('groundnut oil').allergens).toContain('Peanuts');
        expect(ingredientTags('spelt flour').allergens).toContain('Gluten');
        expect(ingredientTags('brown rice flour').allergens).not.toContain('Gluten');
        expect(ingredientTags('cream of tartar').allergens).not.toContain('Dairy');
        expect(ingredientTags('worcestershire sauce').allergens).toContain('Fish');
        for (const key of ['gelatine', 'gelatin', 'suet']) expect(ingredientTags(key).groups).toContain('meat');
    });
});

describe('recipe exclusions', () => {
    const recipes = [recipe('salad', ['lettuce', 'olive oil']), recipe('cheesy', ['cheddar cheese', 'potato']), recipe('pasta', ['spaghetti', 'tomato'])];
    it('removes recipes containing a selected allergen', () => {
        expect(ids(recipes, { allergies: ['Dairy'] })).toEqual(['salad', 'pasta']);
        expect(ids(recipes, { allergies: ['Gluten', 'Dairy'] })).toEqual(['salad']);
        expect(ids(recipes, { allergies: ['None'] })).toEqual(['salad', 'cheesy', 'pasta']);
    });

    it('checks ingredients even when the category says vegetarian', () => {
        const stock = recipe('soup', ['chicken stock', 'leek'], 'French', 'Vegetarian');
        expect(ids([stock, recipe('leeks', ['leek'], 'French', 'Vegetarian')], { dietaryPreferences: ['Vegetarian'] })).toEqual(['leeks']);
    });

    it('applies each diet', () => {
        const all = [recipe('fish', ['salmon']), recipe('bacon', ['bacon', 'egg']), recipe('eggs', ['egg', 'honey']), recipe('mince', ['beef mince']), recipe('beans', ['black bean'])];
        expect(ids(all, { dietaryPreferences: ['Vegan'] })).toEqual(['beans']);
        expect(ids(all, { dietaryPreferences: ['Pescatarian'] })).toEqual(['fish', 'eggs', 'beans']);
        expect(ids(all, { dietaryPreferences: ['No pork'] })).toEqual(['fish', 'eggs', 'mince', 'beans']);
        expect(ids(all, { dietaryPreferences: ['No beef'] })).toEqual(['fish', 'bacon', 'eggs', 'beans']);
        expect(ids(all, { dietaryPreferences: ['High protein'] })).toEqual(['fish', 'bacon', 'eggs', 'mince', 'beans']);
    });

    it('removes recipes with a disliked ingredient', () => {
        expect(ids([recipe('a', ['coriander', 'rice']), recipe('b', ['rice'])], { dislikedIngredients: ['coriander'] })).toEqual(['b']);
    });
});

describe('recipe ranking', () => {
    const recipes = [
        recipe('mexican-beef', ['beef mince'], 'Mexican', 'Beef'),
        recipe('italian-beef', ['beef mince', 'spaghetti'], 'Italian', 'Beef'),
        recipe('italian-chicken', ['chicken breast'], 'Italian', 'Chicken')
    ];
    it('puts preferred cuisines and proteins first', () => {
        expect(ids(recipes, { cuisines: ['Italian'], proteins: ['Chicken'] })).toEqual(['italian-chicken', 'italian-beef', 'mexican-beef']);
    });
    it('keeps the original order with no preferences', () => {
        expect(ids(recipes, { cuisines: ['No preference'], proteins: [] })).toEqual(['mexican-beef', 'italian-beef', 'italian-chicken']);
    });
    it('never relaxes exclusions when nothing ranks', () => {
        expect(ids(recipes, { cuisines: ['Thai'], dietaryPreferences: ['Vegetarian'] })).toEqual([]);
    });
    it('matches plant-based by category', () => {
        expect(ids([recipe('beef', ['beef']), recipe('veg', ['leek'], 'British', 'Vegetarian')], { proteins: ['Plant-based'] })).toEqual(['veg', 'beef']);
    });
});
