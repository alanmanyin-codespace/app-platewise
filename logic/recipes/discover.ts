import type { Recipe } from '@/logic/types';

type Filters = { store: string; maxMinutes: number | null; excludedAllergens: string[] };

export function filterRecipes(recipes: Recipe[], filters: Filters): Recipe[] {
    return recipes.filter((recipe) => {
        const minutes = Number.parseInt(recipe.prepTime, 10);
        return (filters.store === 'All stores' || recipe.store === filters.store) &&
            (filters.maxMinutes === null || (Number.isFinite(minutes) && minutes <= filters.maxMinutes)) &&
            !recipe.allergens.some((allergen) => filters.excludedAllergens.some((excluded) => excluded.toLowerCase() === allergen.toLowerCase()));
    });
}
