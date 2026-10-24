import '../polyfills';

import { Stack } from 'expo-router';

export default function RootLayout() {
    return (
        <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen name='(tabs)' />
            <Stack.Screen name='recipe-detail' />
            <Stack.Screen name='profile-interview' />
        </Stack>
    );
}
