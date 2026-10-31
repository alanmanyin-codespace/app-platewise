import type { ReactNode } from 'react';
import { Redirect, useIsFocused } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useProfileAccess } from '@/logic/auth/useProfileAccess';

export function ProfileAccessGate({ children }: { children: ReactNode }) {
    const focused = useIsFocused();
    // Remount validation whenever the screen is revisited, including after a
    // session is revoked while the app is running.
    return focused ? <VerifyProfileAccess>{children}</VerifyProfileAccess> : null;
}

function VerifyProfileAccess({ children }: { children: ReactNode }) {
    const { access, retry } = useProfileAccess();
    if (access === 'denied') return <Redirect href='/' />;
    if (access === 'loading') return <View style={styles.container}><Text>Checking your account…</Text></View>;
    if (access === 'unavailable') return <View style={styles.container}>
        <Text>Could not verify your account. Check your connection and try again.</Text>
        <Pressable accessibilityRole='button' onPress={retry} style={styles.retry}><Text>Try again</Text></Pressable>
    </View>;
    return <>{children}</>;
}

const styles = StyleSheet.create({ container: { flex: 1, padding: 24, justifyContent: 'center', alignItems: 'center' }, retry: { padding: 12, marginTop: 12 } });
