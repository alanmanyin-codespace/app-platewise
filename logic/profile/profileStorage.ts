import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { supabase } from '@/logic/auth/supabase';
import { accountOwnsProfile, profileFromAccount } from './accountProfile';
import { parseStoredProfile } from './profileState';
import type { Profile } from './types';

const storage = createAsyncStorage('all-about-savings');
const PROFILE_KEY = 'user-profile';

async function currentSession() {
    if (!supabase) return null;
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
}

export async function loadProfile(): Promise<Profile | null> {
    const session = await currentSession();
    if (!session || !supabase) return parseStoredProfile(await storage.getItem(PROFILE_KEY));
    const client = supabase;
    const query = () => client.from('profiles').select('*').eq('id', session.user.id).maybeSingle();
    let { data, error } = await query();
    if (error) throw error;
    if (!data) {
        const initial = profileFromAccount({ id: session.user.id, displayName: session.user.user_metadata?.full_name });
        // Never overwrite a profile another session created concurrently.
        const created = await supabase.from('profiles').upsert({ id: initial.id, display_name: initial.displayName }, { onConflict: 'id', ignoreDuplicates: true });
        if (created.error) throw created.error;
        ({ data, error } = await query());
        if (error) throw error;
        if (!data) throw new Error('The account profile could not be loaded.');
    }
    return {
        id: data.id, displayName: data.display_name, householdSize: data.household_size ?? undefined,
        savingsGoal: data.savings_goal ?? undefined, allergies: data.allergies,
        dietaryPreferences: data.dietary_preferences, mealPlanningPreferences: data.meal_planning_preferences,
        preferredStores: data.preferred_stores, onboardingComplete: data.onboarding_complete, updatedAt: data.updated_at
    };
}

export async function saveProfile(profile: Profile): Promise<void> {
    const session = await currentSession();
    if (!session || !supabase) {
        if (!profile.id.startsWith('anonymous-')) throw new Error('Sign in again to save this profile.');
        await storage.setItem(PROFILE_KEY, JSON.stringify(profile));
        return;
    }
    if (!accountOwnsProfile(profile, session.user.id)) throw new Error('This profile belongs to another account.');
    const { error } = await supabase.from('profiles').upsert({
        id: profile.id, display_name: profile.displayName, household_size: profile.householdSize ?? null,
        savings_goal: profile.savingsGoal ?? null, allergies: profile.allergies,
        dietary_preferences: profile.dietaryPreferences, meal_planning_preferences: profile.mealPlanningPreferences,
        preferred_stores: profile.preferredStores, onboarding_complete: profile.onboardingComplete, updated_at: profile.updatedAt
    });
    if (error) throw error;
}

/** Clears only the local guest profile, never the signed-in account. */
export async function clearProfile(): Promise<void> {
    await storage.removeItem(PROFILE_KEY);
}
