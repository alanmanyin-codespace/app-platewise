import type { Quantity } from './units';

/** Something the user already owns. */
export type PantryItem = {
    ingredientId: string;
    name: string;
    photo?: string;
    quantity: Quantity;
};

/**
 * One ingredient a planned recipe calls for. `quantity` is null when the recipe
 * data does not say how much — distinct from zero, and never treated as covered.
 */
export type RecipeRequirement = {
    ingredientId: string;
    name: string;
    quantity: Quantity | null;
    recipe: string;
};

/** A purchasable package, used later to turn a shortfall into a basket price. */
export type ProductOffer = {
    ingredientId: string;
    name: string;
    store: string;
    packageSize: Quantity;
    flyerPrice: number;
    regPrice: number;
    isFlyerDeal: boolean;
};

/** What one ingredient needs, owns, and is short of, after combining recipes. */
export type RestockLine = {
    ingredientId: string;
    name: string;
    required: Quantity | null;
    inPantry: Quantity | null;
    missing: Quantity | null;
    recipes: string[];
    covered: boolean;
};
