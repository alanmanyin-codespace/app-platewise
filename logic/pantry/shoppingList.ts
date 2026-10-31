import { calculateRestock, getMissingLines } from './restock';
import { toRecipeRequirements } from './recipeRequirements';
import { normalizeIngredientId } from './normalizeIngredient';
import type { PantryItem } from './types';
import type { GroceryItem, Recipe } from '@/logic/types';

export function buildPantryShoppingList(recipes: Recipe[], pantry: PantryItem[]): GroceryItem[] {
    const requirements = recipes.flatMap(toRecipeRequirements);
    return getMissingLines(calculateRestock(requirements, pantry)).map((line) => {
        const ingredient = recipes.flatMap((recipe) => recipe.ingredients).find((item) =>
            (item.ingredientId ?? normalizeIngredientId(item.name)) === line.ingredientId
        );
        return {
            id: `pantry-${line.ingredientId}`,
            name: line.name,
            ingredientId: line.ingredientId,
            quantity: line.missing,
            flyerPrice: ingredient?.flyerPrice ?? 0,
            regPrice: ingredient?.regPrice ?? 0,
            store: ingredient?.store ?? '',
            completed: false,
            recipe: line.recipes.join(', ')
        };
    });
}
