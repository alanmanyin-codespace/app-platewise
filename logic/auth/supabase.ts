import { createClient } from '@supabase/supabase-js';
import { createAsyncStorage } from '@react-native-async-storage/async-storage';
import { AppState, Platform } from 'react-native';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL;
const key = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const storage = createAsyncStorage('all-about-savings');

export const supabase = url && key ? createClient(url, key, {
    auth: {
        storage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: Platform.OS === 'web',
        flowType: 'pkce'
    }
}) : null;

if (supabase && Platform.OS !== 'web') {
    const client = supabase;
    AppState.addEventListener('change', (state) => {
        if (state === 'active') client.auth.startAutoRefresh();
        else client.auth.stopAutoRefresh();
    });
}
