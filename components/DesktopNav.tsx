import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import type { BottomTabBarProps } from 'expo-router/build/layouts/Tabs';
import { Pressable, StyleSheet, Text, View, type PressableStateCallbackType } from 'react-native';
import { theme } from '@/lib/theme';
import { HOME_EDGE_PADDING, HOME_MAX_WIDTH } from '@/lib/layout';

/** Web adds hover and keyboard focus to Pressable's state. */
type WebPressState = PressableStateCallbackType & { hovered?: boolean; focused?: boolean };

type Props = BottomTabBarProps & {
    /** Route names rendered elsewhere in the bar (the account button), not as links. */
    hiddenRoutes: string[];
    signedIn: boolean;
    accountInitial: string;
    onBrandPress: () => void;
    onAccountPress: () => void;
};

/**
 * Desktop web header: wordmark, the main sections as compact links, and the
 * account action on the right. Phones keep the bottom tab bar.
 */
export function DesktopNav({ state, descriptors, navigateToTab, hiddenRoutes, signedIn, accountInitial, onBrandPress, onAccountPress }: Props) {
    const focusedKey = state.routes[state.index]?.key;
    return (
        <View accessibilityRole='header' style={styles.bar}>
            <View style={styles.inner}>
                <Pressable
                    accessibilityRole='link'
                    accessibilityLabel='PlateWise home'
                    onPress={onBrandPress}
                    style={(pressState) => [styles.brand, (pressState as WebPressState).focused && styles.focusRing]}
                >
                    <View style={styles.brandMark}>
                        <MaterialDesignIcons color={theme.colors.primary} name='leaf' size={18} />
                    </View>
                    <Text style={styles.brandName}>PlateWise</Text>
                </Pressable>

                <View accessibilityRole='tablist' style={styles.links}>
                    {state.routes.filter((route) => !hiddenRoutes.includes(route.name)).map((route) => {
                        const { options } = descriptors[route.key];
                        const active = route.key === focusedKey;
                        const color = active ? theme.colors.primary : theme.colors.muted;
                        const label = typeof options.title === 'string' ? options.title : route.name;
                        return (
                            <Pressable
                                accessibilityRole='tab'
                                aria-selected={active}
                                accessibilityLabel={label}
                                key={route.key}
                                onPress={() => { if (!active) navigateToTab(route.key); }}
                                style={(pressState) => {
                                    const { hovered, focused, pressed } = pressState as WebPressState;
                                    return [
                                        styles.link,
                                        (hovered || pressed) && !active && styles.linkHover,
                                        active && styles.linkActive,
                                        focused && styles.focusRing
                                    ];
                                }}
                            >
                                {options.tabBarIcon?.({ focused: active, color, size: 19 })}
                                <Text style={[styles.linkText, { color }, active && styles.linkTextActive]}>{label}</Text>
                            </Pressable>
                        );
                    })}
                </View>

                <Pressable
                    accessibilityRole='button'
                    accessibilityLabel={signedIn ? 'Open account menu' : 'Sign up or log in'}
                    onPress={onAccountPress}
                    style={(pressState) => {
                        const { hovered, focused, pressed } = pressState as WebPressState;
                        return [
                            signedIn ? styles.account : styles.signIn,
                            (hovered || pressed) && (signedIn ? styles.accountHover : styles.signInHover),
                            focused && styles.focusRing
                        ];
                    }}
                >
                    {signedIn ? (
                        <>
                            <View style={styles.avatar}>
                                <Text style={styles.avatarText}>{accountInitial}</Text>
                            </View>
                            <Text style={styles.accountText}>Profile</Text>
                            <MaterialDesignIcons color={theme.colors.muted} name='chevron-down' size={18} />
                        </>
                    ) : (
                        <Text style={styles.signInText}>Sign up / log in</Text>
                    )}
                </Pressable>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    bar: { backgroundColor: theme.colors.background, borderBottomColor: '#ECE8E2', borderBottomWidth: 1, width: '100%' },
    inner: { alignItems: 'center', alignSelf: 'center', flexDirection: 'row', gap: 32, height: 68, maxWidth: HOME_MAX_WIDTH, paddingHorizontal: HOME_EDGE_PADDING, width: '100%' },
    brand: { alignItems: 'center', borderRadius: 10, flexDirection: 'row', gap: 10, paddingVertical: 4 },
    brandMark: { alignItems: 'center', backgroundColor: theme.colors.primarySoft, borderRadius: 10, height: 34, justifyContent: 'center', width: 34 },
    brandName: { color: theme.colors.primaryDark, fontSize: 20, fontWeight: '800', letterSpacing: -0.5 },
    links: { alignItems: 'center', flex: 1, flexDirection: 'row', gap: 4 },
    link: { alignItems: 'center', borderRadius: 999, flexDirection: 'row', gap: 8, height: 40, paddingHorizontal: 14 },
    linkHover: { backgroundColor: theme.colors.canvas },
    linkActive: { backgroundColor: theme.colors.primarySoft },
    linkText: { fontSize: 15, fontWeight: '600' },
    linkTextActive: { fontWeight: '700' },
    signIn: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 999, height: 40, justifyContent: 'center', paddingHorizontal: 18 },
    signInHover: { backgroundColor: theme.colors.primaryDark },
    signInText: { color: theme.colors.white, fontSize: 14, fontWeight: '700' },
    account: { alignItems: 'center', borderColor: theme.colors.border, borderRadius: 999, borderWidth: 1, flexDirection: 'row', gap: 8, height: 40, paddingLeft: 4, paddingRight: 10 },
    accountHover: { backgroundColor: theme.colors.canvas },
    avatar: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 16, height: 30, justifyContent: 'center', width: 30 },
    avatarText: { color: theme.colors.white, fontSize: 13, fontWeight: '800' },
    accountText: { color: theme.colors.text, fontSize: 14, fontWeight: '700' },
    focusRing: { outlineColor: theme.colors.primary, outlineOffset: 2, outlineStyle: 'solid', outlineWidth: 2 }
});
