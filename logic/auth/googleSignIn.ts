import { Platform } from 'react-native';
import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from './supabase';
import { clearProfileReturn, markProfileReturn, type SignInDestination } from './signInReturn';
import { router } from 'expo-router';

WebBrowser.maybeCompleteAuthSession();

export async function signInWithGoogle(destination: SignInDestination = 'profile'): Promise<void> {
    if (!supabase) throw new Error('Supabase is not configured.');
    const redirectTo = Platform.OS === 'web' ? window.location.origin : AuthSession.makeRedirectUri({ scheme: 'myapp', path: 'auth/callback' });
    if (Platform.OS === 'web') markProfileReturn(window.sessionStorage, destination);
    let result;
    try {
        result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo, skipBrowserRedirect: Platform.OS !== 'web' }
        });
        if (result.error) throw result.error;
    } catch (error) {
        if (Platform.OS === 'web') clearProfileReturn(window.sessionStorage);
        throw error;
    }
    const { data } = result;
    if (Platform.OS === 'web') return;
    if (!data.url) throw new Error('Could not start Google sign-in.');
    const browserResult = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
    if (browserResult.type !== 'success') return;
    const callback = new URL(browserResult.url);
    const code = callback.searchParams.get('code');
    if (!code) throw new Error(callback.searchParams.get('error_description') ?? 'Sign-in did not return an authorization code.');
    const exchange = await supabase.auth.exchangeCodeForSession(code);
    if (exchange.error) throw exchange.error;
    if (destination === 'interview') router.replace({ pathname: '/profile-interview', params: { mode: 'create' } });
    else router.replace('/(tabs)/profile');
}
