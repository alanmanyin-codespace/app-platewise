import { describe, expect, it } from 'vitest';
import { toRecipeRequirements } from './recipeRequirements';
import type { Recipe, RecipeIngredient } from '@/logic/types';

function recipe(title: string, ingredients: RecipeIngredient[]): Recipe {
    return {
        id: 'r1',
        title,
        store: 'Metro',
        flyerDate: 'Till Wed, Oct 25',
        flyerItem: '',
        originalPrice: 0,
        flyerPrice: 0,
        savings: 0,
        servings: 4,
        prepTime: '25 min',
        calories: '420 kcal',
        imageUrl: '',
        allergens: [],
        ingredients,
        steps: []
    };
}

function ingredient(name: string, extra: Partial<RecipeIngredient> = {}): RecipeIngredient {
    return { name, store: 'Metro', isFlyerDeal: false, flyerPrice: 0, regPrice: 0, ...extra };
}

describe('deriving requirements from a recipe', () => {
    it('reads the id and amount out of a display name when the data has no structured fields', () => {
        const [requirement] = toRecipeRequirements(
            recipe('Salmon Bake', [ingredient('Atlantic Salmon Fillets (600g)')])
        );

        expect(requirement.ingredientId).toBe('atlantic-salmon-fillets');
        expect(requirement.quantity).toEqual({ amount: 600, unit: 'g' });
        expect(requirement.recipe).toBe('Salmon Bake');
    });

    it('prefers structured fields over the name when the data carries them', () => {
        const [requirement] = toRecipeRequirements(
            recipe('Salmon Bake', [
                ingredient('Atlantic Salmon Fillets (600g)', {
                    ingredientId: 'salmon-fillet',
                    quantity: { amount: 2, unit: 'piece' }
                })
            ])
        );

        expect(requirement.ingredientId).toBe('salmon-fillet');
        expect(requirement.quantity).toEqual({ amount: 2, unit: 'piece' });
    });

    it('reports an unknown amount rather than guessing when the name has none', () => {
        const [requirement] = toRecipeRequirements(
            recipe('Salmon Bake', [ingredient('Fresh Green Asparagus Bunch')])
        );

        expect(requirement.quantity).toBeNull();
    });

    it('covers every ingredient in the recipe', () => {
        const requirements = toRecipeRequirements(
            recipe('Salmon Bake', [
                ingredient('Atlantic Salmon Fillets (600g)'),
                ingredient('Pure Canadian Maple Syrup (250ml)')
            ])
        );

        expect(requirements).toHaveLength(2);
    });

    it('returns nothing for a missing recipe', () => {
        expect(toRecipeRequirements(undefined)).toEqual([]);
    });
});
