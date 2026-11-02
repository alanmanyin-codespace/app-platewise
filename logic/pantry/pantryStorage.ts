import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { parseStoredPantry } from './pantryState';
import type { PantryItem } from './types';

const storage = createAsyncStorage('all-about-savings');
const PANTRY_KEY = 'user-pantry';

export async function loadPantry(): Promise<PantryItem[]> {
    try {
        return parseStoredPantry(await storage.getItem(PANTRY_KEY));
    } catch {
        return [];
    }
}

export async function savePantry(pantry: PantryItem[]): Promise<void> {
    await storage.setItem(PANTRY_KEY, JSON.stringify(pantry));
}

export async function clearPantry(): Promise<void> {
    await storage.removeItem(PANTRY_KEY);
}
