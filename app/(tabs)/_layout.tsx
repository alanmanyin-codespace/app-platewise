import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { router, Tabs } from 'expo-router';
import { theme } from '@/lib/theme';
import { HOME_EDGE_PADDING, HOME_MAX_WIDTH } from '@/lib/layout';
import { Modal, Platform, Pressable, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAtom } from '@/lib/useAtom';
import { authReadyAtom, authSessionAtom } from '@/logic/auth/authState';
import { ProfileSignInDialog } from '@/components/ProfileSignInDialog';
import { DesktopNav } from '@/components/DesktopNav';

/** Phones retain a thumb-reachable bottom bar; wide web layouts use a header. */
const DESKTOP_MIN_WIDTH = 1024;

export const unstable_settings = { initialRouteName: 'index' };

export default function Layout() {
    const { width } = useWindowDimensions();
    const insets = useSafeAreaInsets();
    const [session] = useAtom(authSessionAtom);
    const [ready] = useAtom(authReadyAtom);
    const [menuOpen, setMenuOpen] = useState(false);
    const [dialogOpen, setDialogOpen] = useState(false);

    function openAccount() {
        if (!ready) return;
        if (session) setMenuOpen(true);
        else setDialogOpen(true);
    }
    const isDesktop = Platform.OS === 'web' && width >= DESKTOP_MIN_WIDTH;
    const accountName = String(session?.user.user_metadata?.full_name ?? session?.user.email ?? '');
    const accountInitial = accountName.trim().charAt(0).toUpperCase() || 'P';
    const headerEdge = Math.max(HOME_EDGE_PADDING, (width - HOME_MAX_WIDTH) / 2 + HOME_EDGE_PADDING);

    return (
        <>
        {isDesktop && <View style={styles.announcement}><Text style={styles.announcementText}>A little inspiration for every meal</Text></View>}
        <Tabs
            tabBar={isDesktop ? (props) => (
                <DesktopNav
                    {...props}
                    accountInitial={accountInitial}
                    hiddenRoutes={['profile']}
                    onAccountPress={openAccount}
                    onBrandPress={() => router.navigate('/')}
                    signedIn={!!session}
                />
            ) : undefined}
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: '#717171',
                tabBarPosition: isDesktop ? 'top' : 'bottom',
                tabBarVariant: 'uikit',
                tabBarLabelPosition: isDesktop ? 'beside-icon' : 'below-icon',
                tabBarLabelStyle: isDesktop
                    ? { fontSize: 14, fontWeight: '600' }
                    : { fontSize: width < 360 ? 10 : 11, fontWeight: '600', letterSpacing: width < 360 ? -0.2 : 0, marginHorizontal: 0 },
                // Six tabs share a phone's width; drop side padding so labels are not cut off.
                tabBarItemStyle: isDesktop ? undefined : { paddingHorizontal: 0 },
                tabBarStyle: Platform.OS === 'web'
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
                name='index'
                options={{ title: 'Home', tabBarIcon: ({ color, size }) => (
                    <MaterialDesignIcons color={color} name='home-outline' size={size} />
                ) }}
            />
            <Tabs.Screen
                name='deals'
                options={{ title: 'Deals', tabBarIcon: ({ color, size }) => (
                    <MaterialDesignIcons color={color} name='tag-outline' size={size} />
                ) }}
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
                    title: 'Meal Plan',
                    tabBarLabel: isDesktop ? 'Meal Plan' : 'Plan'
                }}
            />
            <Tabs.Screen
                name='groceries'
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='cart-outline' size={size} />
                    ),
                    title: 'Groceries',
                    tabBarLabel: isDesktop ? 'Groceries' : 'Grocery'
                }}
            />
            <Tabs.Screen
                name='pantry'
                options={{ title: 'Pantry', tabBarIcon: ({ color, size }) => (
                    <MaterialDesignIcons color={color} name='fridge-outline' size={size} />
                ) }}
            />
            <Tabs.Screen
                name='profile'
                listeners={{ tabPress: (event) => { event.preventDefault(); openAccount(); } }}
                options={{
                    headerShown: false,
                    tabBarIcon: ({ color, size }) => (
                        <MaterialDesignIcons color={color} name='account-circle-outline' size={size} />
                    ),
                    title: session ? 'Profile' : 'Sign up / login',
                    tabBarLabel: session ? 'Profile' : 'Account'
                }}
            />
        </Tabs>
        <Modal transparent visible={menuOpen} animationType='fade' onRequestClose={() => setMenuOpen(false)}>
            <View style={styles.modal}>
                <Pressable accessibilityRole='button' accessibilityLabel='Close account menu' style={StyleSheet.absoluteFill} onPress={() => setMenuOpen(false)} />
                <View accessibilityViewIsModal style={[styles.menu, isDesktop ? [styles.desktopMenu, { right: headerEdge }] : { bottom: Math.max(insets.bottom, 0) + 68, left: Math.max(12, (width - 860) / 2 + 12) }]}>
                    <Text style={styles.menuTitle}>Account</Text>
                    {session?.user.email && <Text numberOfLines={1} style={styles.email}>{session.user.email}</Text>}
                    {session ? (
                        <Pressable accessibilityRole='button' style={styles.menuItem} onPress={() => { setMenuOpen(false); router.navigate('/(tabs)/profile'); }}>
                            <MaterialDesignIcons name='account-outline' color='#26352F' size={22} />
                            <Text style={styles.menuItemText}>View profile</Text>
                        </Pressable>
                    ) : null}
                </View>
            </View>
        </Modal>
        {dialogOpen && <ProfileSignInDialog destination='profile' onClose={() => setDialogOpen(false)} onAuthenticated={() => setDialogOpen(false)} />}
        </>
    );
}

const styles = StyleSheet.create({
    modal: { flex: 1, backgroundColor: 'rgba(0, 0, 0, 0.14)' },
    menu: { position: 'absolute', width: 250, maxWidth: '90%', padding: 14, borderRadius: 14, backgroundColor: '#fff', borderWidth: 1, borderColor: '#e7e7e7', elevation: 8, shadowColor: '#000', shadowOpacity: 0.15, shadowRadius: 12, shadowOffset: { width: 0, height: 4 } },
    announcement: { height: 32, backgroundColor: '#2d6a5b', alignItems: 'center', justifyContent: 'center' },
    announcementText: { color: '#fff', fontSize: 12, fontWeight: '600' },
    desktopMenu: { top: 108 },
    menuTitle: { color: '#222', fontSize: 14, fontWeight: '800', paddingHorizontal: 8, paddingBottom: 8 },
    email: { color: '#717171', fontSize: 12, paddingHorizontal: 8, paddingBottom: 8 },
    menuItem: { minHeight: 48, flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 8, borderRadius: 8 },
    menuItemText: { color: '#26352F', fontSize: 14, fontWeight: '600' }
});
