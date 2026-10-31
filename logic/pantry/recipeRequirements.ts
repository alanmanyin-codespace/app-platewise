import { normalizeIngredientId, parseQuantityFromName } from './normalizeIngredient';
import type { RecipeRequirement } from './types';
import type { Recipe } from '@/logic/types';

/**
 * Turns a recipe's ingredient list into pantry-matchable requirements.
 *
 * Structured fields win where present. Otherwise the id and amount are read
 * out of the display name, which is where today's data keeps them
 * ("Atlantic Salmon Fillets (600g)"). A name that carries no amount yields a
 * null quantity, which downstream means "still needed" rather than "none".
 */
export function toRecipeRequirements(recipe?: Recipe): RecipeRequirement[] {
    if (!recipe) {
        return [];
    }

    return recipe.ingredients.map((ingredient) => ({
        ingredientId: ingredient.ingredientId ?? normalizeIngredientId(ingredient.name),
        name: ingredient.name,
        quantity: ingredient.quantity ?? parseQuantityFromName(ingredient.name),
        recipe: recipe.title
    }));
}
