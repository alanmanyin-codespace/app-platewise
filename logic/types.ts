import type { Quantity } from '@/logic/pantry/units';

export type RecipeIngredient = {
    name: string;
    store: string;
    isFlyerDeal: boolean;
    flyerPrice: number;
    regPrice: number;
    /**
     * Pantry matching needs a stable id and a structured amount, which the
     * display name alone cannot give reliably. Both are optional so existing
     * recipe data keeps working: where they are absent they are derived from
     * the name, and an amount that cannot be derived stays unknown rather than
     * being assumed. Backfill these on real data to make matching exact.
     */
    ingredientId?: string;
    quantity?: Quantity;
};

export type Recipe = {
    id: string;
    title: string;
    store: string;
    flyerDate: string;
    flyerItem: string;
    originalPrice: number;
    flyerPrice: number;
    savings: number;
    servings: number;
    prepTime: string;
    calories: string;
    imageUrl: string;
    allergens: string[];
    ingredients: RecipeIngredient[];
    steps: string[];
};

export type GroceryItem = {
    ingredientId?: string;
    quantity?: Quantity | null;
    id: string;
    name: string;
    flyerPrice: number;
    regPrice: number;
    store: string;
    completed: boolean;
    recipe: string;
};

export type MealPlanDay = {
    day: string;
    meal: string;
    store: string;
    cost: number;
    savings: number;
    time: string;
    image: string;
};
