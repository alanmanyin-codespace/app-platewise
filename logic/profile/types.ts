export type Profile = {
    id: string;
    displayName: string;
    householdSize?: number;
    savingsGoal?: string;
    allergies: string[];
    dietaryPreferences: string[];
    mealPlanningPreferences: string[];
    preferredStores: string[];
    onboardingComplete: boolean;
    updatedAt: string;
};

export type ProfilePatch = Partial<
    Omit<Profile, 'id' | 'updatedAt' | 'allergies' | 'dietaryPreferences' | 'mealPlanningPreferences' | 'preferredStores'>
> &
    Partial<Pick<Profile, 'allergies' | 'dietaryPreferences' | 'mealPlanningPreferences' | 'preferredStores'>>;

export type ProfileListField =
    | 'allergies'
    | 'dietaryPreferences'
    | 'mealPlanningPreferences'
    | 'preferredStores';
