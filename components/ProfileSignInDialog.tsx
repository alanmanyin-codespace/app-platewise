import { useEffect, useState } from 'react';
import * as AuthSession from 'expo-auth-session';
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { useAtom } from '@/lib/useAtom';
import { authErrorAtom, authReadyAtom, authSessionAtom } from '@/logic/auth/authState';
import { profileHydratedAtom } from '@/logic/profile/profileState';
import { signInWithEmail, signUpWithEmail } from '@/logic/auth/emailSignIn';
import { signInWithGoogle } from '@/logic/auth/googleSignIn';
import type { SignInDestination } from '@/logic/auth/signInReturn';

type Props = { onClose: () => void; onAuthenticated: () => void; destination?: SignInDestination };

export function ProfileSignInDialog({ onClose, onAuthenticated, destination = 'interview' }: Props) {
    const [mode, setMode] = useState<'signup' | 'signin'>('signup');
    const [confirmationSent, setConfirmationSent] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [pendingUser, setPendingUser] = useState<string | null>(null);
    const [error, setError] = useState('');
    const [session] = useAtom(authSessionAtom);
    const [ready] = useAtom(authReadyAtom);
    const [hydrated] = useAtom(profileHydratedAtom);
    const [authError] = useAtom(authErrorAtom);
    const waiting = !!pendingUser && !(ready && authError);
    const busy = loading || waiting;

    useEffect(() => {
        if (pendingUser && ready && hydrated && session?.user.id === pendingUser) onAuthenticated();
    }, [pendingUser, ready, hydrated, session?.user.id, onAuthenticated]);

    async function emailLogin() {
        if (busy) return;
        if (!email.trim() || !password) { setError('Enter your email and password.'); return; }
        setLoading(true);
        setError('');
        try {
            const redirectTo = Platform.OS === 'web' ? window.location.origin : AuthSession.makeRedirectUri({ scheme: 'myapp', path: 'auth/callback' });
            const userId = mode === 'signup' ? await signUpWithEmail(email, password, redirectTo) : await signInWithEmail(email, password);
            setPassword('');
            if (userId) setPendingUser(userId);
            else setConfirmationSent(true);
        } catch {
            setError(mode === 'signup' ? 'Could not create your account. Check your details and try again.' : 'Could not sign in. Check your email and password and try again.');
        } finally { setLoading(false); }
    }

    async function googleLogin() {
        if (busy) return;
        setLoading(true);
        setError('');
        try { await signInWithGoogle(destination); }
        catch { setError('Could not start Google sign-in. Please try again.'); }
        finally { setLoading(false); }
    }

    return <Modal transparent visible animationType='fade' onRequestClose={() => { if (!busy) onClose(); }}>
        <KeyboardAvoidingView style={styles.overlay} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
            <Pressable accessibilityRole='button' accessibilityLabel='Close account dialog' onPress={() => { if (!busy) onClose(); }} style={StyleSheet.absoluteFill} />
            <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps='handled'>
                <View accessibilityViewIsModal style={styles.dialog}>
                    <View style={styles.top}>
                        <View style={styles.icon}><MaterialDesignIcons name='account-heart-outline' size={24} color='#2d6a5b' /></View>
                        <Pressable accessibilityRole='button' accessibilityLabel='Close' disabled={busy} onPress={onClose} style={styles.close}><MaterialDesignIcons name='close' size={22} color='#66766c' /></Pressable>
                    </View>
                    <Text accessibilityRole='header' style={styles.title}>{mode === 'signup' ? 'Create your account' : 'Welcome back'}</Text>
                    <Text style={styles.description}>{mode === 'signup' ? 'Create an account to save your PlateWise profile.' : 'Sign in to save your PlateWise profile.'}</Text>
                    <Text style={styles.label}>Email</Text>
                    <TextInput accessibilityLabel='Email' autoFocus autoCapitalize='none' autoComplete='email' keyboardType='email-address' value={email} onChangeText={setEmail} editable={!busy} placeholder='you@example.com' style={styles.input} />
                    <Text style={styles.label}>Password</Text>
                    <TextInput accessibilityLabel='Password' autoCapitalize='none' autoComplete={mode === 'signup' ? 'new-password' : 'current-password'} secureTextEntry value={password} onChangeText={setPassword} editable={!busy} placeholder='Your password' onSubmitEditing={emailLogin} style={styles.input} />
                    {confirmationSent && <Text accessibilityRole='alert' style={styles.notice}>Check your email to confirm your account, then return to this dialog and sign in.</Text>}
                    {!!error && <Text accessibilityRole='alert' style={styles.error}>{error}</Text>}
                    {!!pendingUser && !!authError && ready && <Text accessibilityRole='alert' style={styles.error}>Signed in, but your profile could not be loaded. Close this dialog and try again.</Text>}
                    <Pressable accessibilityRole='button' disabled={busy} onPress={emailLogin} style={[styles.primary, busy && styles.disabled]}><Text style={styles.primaryText}>{busy ? (mode === 'signup' ? 'Creating account…' : 'Signing in…') : (mode === 'signup' ? 'Create account' : 'Sign in')}</Text></Pressable>
                    <View style={styles.divider}><View style={styles.line} /><Text style={styles.dividerText}>or</Text><View style={styles.line} /></View>
                    <Pressable accessibilityRole='button' accessibilityLabel='Continue with Google' disabled={busy} onPress={googleLogin} style={[styles.google, busy && styles.disabled]}>
                        <MaterialDesignIcons name='google' size={20} color='#294b3c' /><Text style={styles.googleText}>Continue with Google</Text>
                    </Pressable>
                    <View style={styles.switchRow}><Text style={styles.switchText}>{mode === 'signup' ? 'Already have an account? ' : 'New to PlateWise? '}</Text><Pressable accessibilityRole='button' disabled={busy} onPress={() => { setMode(mode === 'signup' ? 'signin' : 'signup'); setError(''); setPassword(''); }}><Text style={styles.switchLink}>{mode === 'signup' ? 'Sign in' : 'Sign up'}</Text></Pressable></View>
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    </Modal>;
}

const styles = StyleSheet.create({
    overlay: { flex: 1, backgroundColor: 'rgba(14, 35, 27, 0.58)' }, scroll: { flexGrow: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
    dialog: { width: '100%', maxWidth: 440, borderRadius: 22, padding: 26, backgroundColor: '#fff', shadowColor: '#102a20', shadowOpacity: 0.18, shadowRadius: 25, shadowOffset: { width: 0, height: 12 }, elevation: 10 },
    top: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }, icon: { height: 48, width: 48, borderRadius: 15, backgroundColor: '#e8f2e4', justifyContent: 'center', alignItems: 'center' }, close: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
    title: { color: '#203c2f', fontSize: 25, fontWeight: '800', letterSpacing: -0.5, marginTop: 18 }, description: { color: '#68796d', fontSize: 14, lineHeight: 21, marginTop: 6, marginBottom: 12 },
    label: { color: '#31483a', fontSize: 13, fontWeight: '700', marginTop: 14, marginBottom: 6 }, input: { borderWidth: 1, borderColor: '#d8e3d8', borderRadius: 10, minHeight: 48, paddingHorizontal: 13, fontSize: 16, color: '#203c2f', backgroundColor: '#fbfcfa' },
    primary: { backgroundColor: '#2d6a5b', borderRadius: 10, alignItems: 'center', justifyContent: 'center', minHeight: 49, marginTop: 20 }, primaryText: { color: '#fff', fontWeight: '800', fontSize: 14 }, disabled: { opacity: 0.55 },
    divider: { flexDirection: 'row', alignItems: 'center', gap: 12, marginVertical: 18 }, line: { flex: 1, height: 1, backgroundColor: '#e6ece5' }, dividerText: { color: '#89968b', fontSize: 12 },
    notice: { color: '#2d6a5b', fontSize: 13, lineHeight: 19, marginTop: 12 }, switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 22 }, switchText: { color: '#68796d', fontSize: 13 }, switchLink: { color: '#2d6a5b', fontSize: 13, fontWeight: '800' },
    google: { flexDirection: 'row', gap: 10, justifyContent: 'center', alignItems: 'center', borderWidth: 1, borderColor: '#d8e3d8', borderRadius: 10, minHeight: 49 }, googleText: { color: '#294b3c', fontSize: 14, fontWeight: '700' }, error: { color: '#a3322d', fontSize: 13, lineHeight: 18, marginTop: 12 }
});
