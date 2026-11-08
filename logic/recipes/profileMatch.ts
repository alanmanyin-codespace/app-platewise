import type { Profile } from '../profile/types';
import { ingredientTags, type IngredientGroup } from './ingredientTags';
import type { ProteinOption } from './recipeOptions';

/** The parts of a recipe the profile acts on. */
export type MatchableRecipe = { id: string; area: string | null; category: string | null; ingredientKeys: string[] };

const NO_CHOICE = new Set(['None', 'No preference']);
const DIET_EXCLUDES: Record<string, IngredientGroup[]> = {
    Vegetarian: ['meat', 'fish', 'seafood'],
    Vegan: ['meat', 'fish', 'seafood', 'dairy', 'egg', 'honey'],
    Pescatarian: ['meat'],
    'No pork': ['pork'],
    'No beef': ['beef']
};
// Ingredient groups that count towards a protein; Plant-based counts by category only.
const PROTEIN_GROUPS: Record<string, IngredientGroup[]> = {
    Beef: ['beef'], Chicken: ['chicken'], Pork: ['pork'], Lamb: ['lamb'], Goat: ['goat'], Seafood: ['fish', 'seafood']
};
const chosen = (values: string[]) => values.filter((value) => !NO_CHOICE.has(value));

/**
 * Removes recipes with a selected allergen, a food the diet rules out, or a disliked
 * ingredient; orders the rest by cuisine (+2) and preferred proteins (+1 each).
 * Ties keep the input order. Exclusions are never relaxed.
 */
export function matchRecipes<T extends MatchableRecipe>(recipes: T[], profile: Profile, proteins: ProteinOption[]): T[] {
    const allergies = new Set(chosen(profile.allergies));
    const excludedGroups = new Set(chosen(profile.dietaryPreferences).flatMap((diet) => DIET_EXCLUDES[diet] ?? []));
    const disliked = new Set(profile.dislikedIngredients);
    const cuisines = new Set(chosen(profile.cuisines));
    const preferred = proteins.filter((protein) => chosen(profile.proteins).includes(protein.name));

    return recipes
        .map((recipe, index) => {
            const tags = recipe.ingredientKeys.map(ingredientTags);
            const groups = new Set(tags.flatMap((tag) => tag.groups));
            const excluded = recipe.ingredientKeys.some((key) => disliked.has(key)) ||
                tags.some((tag) => tag.allergens.some((allergen) => allergies.has(allergen))) ||
                [...excludedGroups].some((group) => groups.has(group));
            const score = (recipe.area && cuisines.has(recipe.area) ? 2 : 0) +
                preferred.filter((protein) => (recipe.category && protein.categories.includes(recipe.category)) ||
                    (PROTEIN_GROUPS[protein.name] ?? []).some((group) => groups.has(group))).length;
            return { recipe, index, excluded, score };
        })
        .filter((item) => !item.excluded)
        .sort((a, b) => b.score - a.score || a.index - b.index)
        .map((item) => item.recipe);
}
