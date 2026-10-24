export type RecipeIngredient = {
    name: string;
    store: string;
    isFlyerDeal: boolean;
    flyerPrice: number;
    regPrice: number;
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
