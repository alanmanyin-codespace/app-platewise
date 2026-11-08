export type Profile = {
    id: string;
    displayName: string;
    householdSize?: number;
    savingsGoal?: string;
    allergies: string[];
    dietaryPreferences: string[];
    mealPlanningPreferences: string[];
    preferredStores: string[];
    /** Cuisine area names from the recipe catalogue. */
    cuisines: string[];
    /** Protein option names, e.g. Chicken or Plant-based. */
    proteins: string[];
    /** Ingredient keys as built by platewise-api. */
    dislikedIngredients: string[];
    onboardingComplete: boolean;
    updatedAt: string;
};

export type ProfilePatch = Partial<
    Omit<Profile, 'id' | 'updatedAt' | ProfileListField>
> &
    Partial<Pick<Profile, ProfileListField>>;

export type ProfileListField =
    | 'allergies'
    | 'dietaryPreferences'
    | 'mealPlanningPreferences'
    | 'preferredStores'
    | 'cuisines'
    | 'proteins'
    | 'dislikedIngredients';
