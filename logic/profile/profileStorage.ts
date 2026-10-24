import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import type { Profile } from './types';
import { parseStoredProfile } from './profileState';

const storage = createAsyncStorage('all-about-savings');
const PROFILE_KEY = 'user-profile';

export async function loadProfile(): Promise<Profile | null> {
    try {
        return parseStoredProfile(await storage.getItem(PROFILE_KEY));
    } catch {
        return null;
    }
}

export async function saveProfile(profile: Profile): Promise<void> {
    await storage.setItem(PROFILE_KEY, JSON.stringify(profile));
}

export async function clearProfile(): Promise<void> {
    await storage.removeItem(PROFILE_KEY);
}
