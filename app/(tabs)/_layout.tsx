import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { router, Tabs } from 'expo-router';
import { theme } from '@/lib/theme';
import { Alert, Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAtom } from '@/lib/useAtom';
import { authReadyAtom, authSessionAtom } from '@/logic/auth/authState';
import { signInWithGoogle } from '@/logic/auth/googleSignIn';

/**
 * Below this width the bottom bar stays: it is thumb-reachable, which is the
 * whole point of the pattern. Above it a bottom bar is just a phone affordance
 * stranded on a desk, so navigation moves to a persistent left rail.
 */
const DESKTOP_MIN_WIDTH = 1024;

export const unstable_settings = { initialRouteName: 'index' };

export default function Layout() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [session] = useAtom(authSessionAtom);
    const [ready] = useAtom(authReadyAtom);
    const [menuOpen, setMenuOpen] = useState(false);
    const [signingIn, setSigningIn] = useState(false);
    const [error, setError] = useState('');

    async function signIn() {
        setError('');
        setSigningIn(true);
        try { await signInWithGoogle(); }
        catch {
            if (Platform.OS !== 'web') Alert.alert('Sign-in unavailable', 'Please try again.');
            setError('Could not start sign-in. Please try again.');
            setMenuOpen(true);
        } finally { setSigningIn(false); }
    }
    function openAccount() {
        setError('');
        if (!ready || signingIn) return;
        if (session) setMenuOpen(true);
        else void signIn();
    }
    const isDesktop = Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;

    return (
        <>
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#717171',
                tabBarPosition: isDesktop ? 'left' : 'bottom',
                // The rail reads as a list of destinations, so the label sits
                // beside its icon; the bottom bar keeps labels stacked under.
                tabBarVariant: isDesktop ? 'material' : 'uikit',
                tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
                tabBarLabelStyle: isDesktop
                    ? { fontSize: 14, fontWeight: '600' }
                    : { fontSize: 11, fontWeight: '600' },
                tabBarStyle: isDesktop
                    ? {
                          backgroundColor: theme.colors.background,
                          borderRightColor: '#EBEBEB',
                          borderRightWidth: 1,
                          // The rail defaults to Material's 360dp navigation
                          // *drawer* width, which is wider than a third of the
                          // 860px content column. minWidth has to come down
                          // with width or it keeps winning in CSS.
                          minWidth: 232,
                          paddingTop: 12,
                          width: 232
                      }
                    : Platform.OS === 'web'
                      ? {
                            alignSelf: 'center',
                            backgroundColor: theme.colors.background,
                            borderTopColor: '#EBEBEB',
                            borderTopWidth: 1,
                            height: 64,
                            maxWidth: 860,
                            width: '100%'
                        }
                      : { backgroundColor: theme.colors.background, height: 60 }
            }}
        >
            <Tabs.Screen
                name='profile'
                listeners={{ tabPress: (event) => { event.preventDefault(); openAccount(); } }}
                options={{
                    // A hidden route is redirected away by Expo Router; hide only its rail button.
                    ...(isDesktop ? { tabBarButton: () => null } : {}),
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='account-circle-outline' size={size} />
                    ),
                    title: session ? 'Profile' : 'Sign in'
                }}
            />
            <Tabs.Screen
                name='index'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='tag-outline' size={size} />
                    ),
                    title: 'Deals'
                }}
            />
            <Tabs.Screen
                name='planner'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons
                            color={color}
                            name='calendar-month-outline'
                            size={size}
                        />
                    ),
                    title: 'Meal Plan'
                }}
            />
            <Tabs.Screen
                name='groceries'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='cart-outline' size={size} />
                    ),
                    title: 'Groceries'
                }}
            />
            <Tabs.Screen
                name='pantry'
                options={{ title: 'Pantry', tabBarIcon: ({ color, size }) => (
                    <MaterialDesignIcons color={color} name='fridge-outline' size={size} />
                ) }}
            />
        </Tabs>
        {isDesktop && <Pressable accessibilityRole='button' accessibilityLabel={session ? 'Account' : 'Sign in with Google'} disabled={!ready || signingIn} onPress={openAccount} style={styles.desktopButton}><MaterialDesignIcons name='account-circle-outline' color='#26352F' size={28} /><Text style={styles.desktopSignInText}>{session ? 'Account' : 'Sign in'}</Text></Pressable>}
        <Modal transparent visible={menuOpen} animationType='fade' onRequestClose={() => setMenuOpen(false)}>
            <View style={styles.modal}>
                <Pressable accessibilityRole='button' accessibilityLabel='Close account menu' style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
                <View accessibilityViewIsModal style={[styles.menu, isDesktop ? styles.desktopMenu : { bottom: Math.max(insets.bottom, 0) + 68, left: Math.max(12, (width - 860) / 2 + 12) }]}>
                    <Text style={styles.menuTitle}>Account</Text>
                    {session?.user.email && <Text numberOfLines={1} style={styles.email}>{session.user.email}</Text>}
                    {session ? (
                        <Pressable accessibilityRole='button' style={styles.menuItem} onPress={() => { setMenuOpen(false); router.navigate('/(tabs)/profile'); }}>
                            <MaterialDesignIcons name='account-outline' color='#26352F' size={22} />
                            <Text style={styles.menuItemText}>View profile</Text>
                        </Pressable>
                    ) : null}
                    {!!error && <Text accessibilityRole='alert' style={styles.error}>{error}</Text>}
                </View>
            </View>
        </Modal>
        </>
    );
}

const styles = StyleSheet.create({
    modal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.14)' },
    menu: { position: 'absolute', width: 250, maxWidth: '90%', padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e7e7', elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    desktopMenu: { left: 24, bottom: 88 },
    desktopButton: { position: 'absolute', left: 0, bottom: 0, width: 232, minHeight: 64, paddingHorizontal: 20, flexDirection: 'row', gap: 12, backgroundColor: '#fff', borderTopWidth: 1, borderRightWidth: 1, borderColor: '#ebebeb', alignItems: 'center' },
    desktopSignInText: { color: '#26352F', fontSize: 14, fontWeight: '700' },
    menuTitle: { color: '#222', fontSize: 14, fontWeight: '800', paddingHorizontal: 8, paddingBottom: 8 },
    email: { color: '#717171', fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
    menuItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, borderRadius: 8 },
    menuItemText: { color: '#26352F', fontSize: 14, fontWeight: '600' },
    error: { color: '#b02c42', fontSize: 12, paddingHorizontal: 8, paddingTop: 6 }
});
