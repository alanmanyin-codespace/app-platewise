import '../polyfills';

import { Stack } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { installBrowserSurfaces } from '@/lib/web/browserSurfaces';

installBrowserSurfaces();

export default function RootLayout() {
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
