import { describe, expect, it } from 'vitest';
import { buildPantryShoppingList } from './shoppingList';
import type { Recipe } from '@/logic/types';

const recipe = (id: string, amount: number): Recipe => ({ id, title: id, store: 'Store', flyerDate: '', flyerItem: '', originalPrice: 0, flyerPrice: 0, savings: 0, servings: 1, prepTime: '', calories: '', imageUrl: '', allergens: [], steps: [], ingredients: [{ name: 'Rice', ingredientId: 'rice', quantity: { amount, unit: 'g' }, store: 'Store', isFlyerDeal: false, flyerPrice: 2, regPrice: 3 }] });

describe('pantry shopping list', () => {
    it('combines recipes and subtracts pantry stock once', () => {
        const result = buildPantryShoppingList([recipe('one', 300), recipe('two', 400)], [{ ingredientId: 'rice', name: 'Rice', quantity: { amount: 500, unit: 'g' } }]);
        expect(result).toHaveLength(1);
        expect(result[0].quantity).toEqual({ amount: 200, unit: 'g' });
    });
    it('excludes fully covered ingredients', () => {
        expect(buildPantryShoppingList([recipe('one', 300)], [{ ingredientId: 'rice', name: 'Rice', quantity: { amount: 400, unit: 'g' } }])).toEqual([]);
    });
});
