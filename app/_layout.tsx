import '../polyfills';

import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { getDefaultStore } from 'jotai';
import { pantryAtom, pantryHydratedAtom } from '@/logic/pantry/pantryState';
import { loadPantry } from '@/logic/pantry/pantryStorage';
import { supabase } from '@/logic/auth/supabase';
import { authErrorAtom, authReadyAtom, authSessionAtom } from '@/logic/auth/authState';
import { takeSignInReturn } from '@/logic/auth/signInReturn';
import { loadProfile } from '@/logic/profile/profileStorage';
import { profileAtom, profileHydratedAtom } from '@/logic/profile/profileState';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { Platform, StyleSheet, View } from 'react-native';
import { installBrowserSurfaces } from '@/lib/web/browserSurfaces';

installBrowserSurfaces();

export default function RootLayout() {
    useEffect(() => {
        const store = getDefaultStore();
        let active = true;
        let generation = 0;
        async function refresh() {
            const current = ++generation;
            store.set(authReadyAtom, false);
            store.set(authErrorAtom, null);
            store.set(profileHydratedAtom, false);
            store.set(profileAtom, null);
            store.set(allergyFiltersAtom, []);
            try {
                const result = supabase ? await supabase.auth.getSession() : null;
                if (result?.error) throw result.error;
                const session = result?.data.session ?? null;
                if (active && generation === current) store.set(authSessionAtom, session);
                const profile = await loadProfile();
                if (!active || generation !== current) return;
                store.set(authSessionAtom, session);
                store.set(profileAtom, profile);
                store.set(allergyFiltersAtom, profile?.allergies ?? []);
                store.set(profileHydratedAtom, true);
                if (Platform.OS === 'web') {
                    const destination = takeSignInReturn(window.sessionStorage, !!session);
                    if (destination === 'interview') router.replace({ pathname: '/profile-interview', params: { mode: 'create' } });
                    else if (destination === 'profile') router.replace('/(tabs)/profile');
                }
            } catch {
                if (active && generation === current) store.set(authErrorAtom, 'Unable to load your profile. Check your connection and try again.');
            } finally {
                if (active && generation === current) store.set(authReadyAtom, true);
            }
        }
        // Supabase callbacks must return immediately; profile loading calls Supabase again.
        const listener = supabase?.auth.onAuthStateChange((event) => { if (event === 'INITIAL_SESSION' || event === 'SIGNED_IN' || event === 'SIGNED_OUT' || event === 'USER_UPDATED') setTimeout(() => { void refresh(); }, 0); });
        if (!supabase) void refresh();
        return () => { active = false; generation++; listener?.data.subscription.unsubscribe(); };
    }, []);
    useEffect(() => {
        let active = true;
        loadPantry().then((items) => {
            if (!active) return;
            const store = getDefaultStore();
            store.set(pantryAtom, items);
            store.set(pantryHydratedAtom, true);
        });
        return () => { active = false; };
    }, []);
    return (
        // One `main` landmark for the whole app. Tab screens can stay mounted
        // behind the active one, so marking each screen individually would emit
        // several `main` elements into the page.
        <View role='main' style={styles.root}>
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Screen name='(tabs)' />
                <Stack.Screen name='recipe-detail' />
                <Stack.Screen name='profile-interview' />
            </Stack>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1
    }
});
