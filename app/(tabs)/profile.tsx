import { ProfilePreferenceEditor } from '@/components/ProfilePreferenceEditor';
import { ProfileSummaryCard } from '@/components/ProfileSummaryCard';
import { theme } from '@/lib/theme';
import { useAtom } from '@/lib/useAtom';
import { toggleAllergy } from '@/logic/actions/toggleAllergy';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { loadProfile, saveProfile } from '@/logic/profile/profileStorage';
import { profileAtom, profileHydratedAtom, toggleProfileListValue } from '@/logic/profile/profileState';
import type { ProfileListField } from '@/logic/profile/types';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { Tabs, router } from 'expo-router';
import { useEffect } from 'react';
import { Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const canadianStores = [
    { name: 'No Frills', distance: '0.8 km', status: 'Flyer valid till Thu' },
    { name: 'Metro', distance: '1.2 km', status: 'Flyer valid till Wed' },
    { name: 'FreshCo', distance: '2.1 km', status: 'Flyer valid till Wed' },
    { name: 'Walmart Supercentre', distance: '3.4 km', status: 'Flyer valid till Wed' },
    { name: 'Food Basics', distance: '4.0 km', status: 'Flyer valid till Thu' }
];

export default function Profile() {
    const [profile, setProfile] = useAtom(profileAtom);
    const [, setAllergyFilters] = useAtom(allergyFiltersAtom);
    const [, setHydrated] = useAtom(profileHydratedAtom);

    useEffect(() => {
        loadProfile().then((storedProfile) => {
            if (storedProfile) {
                setProfile(storedProfile);
                setAllergyFilters(storedProfile.allergies);
            }
            setHydrated(true);
        });
    }, [setAllergyFilters, setHydrated, setProfile]);

    async function handleToggle(field: ProfileListField, value: string) {
        if (!profile) return;
        const updated = toggleProfileListValue(profile, field, value);
        setProfile(updated);
        if (field === 'allergies') {
            toggleAllergy({ allergen: value });
            setAllergyFilters(updated.allergies);
        }
        await saveProfile(updated);
    }

    return (
        <>
            <StatusBar barStyle='dark-content' />
            <Tabs.Screen options={{ headerShown: false, tabBarIcon: ({ color, size }) => <MaterialDesignIcons color={color} name='account-cog-outline' size={size} />, title: 'Profile' }} />
            <SafeAreaView edges={['top']} style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.content}>
                    <Text accessibilityRole='header' accessibilityLevel={1} style={styles.title}>
                        Profile
                    </Text>
                    <Text style={styles.subtitle}>Control what recipes are generated from flyer sale deals</Text>
                    <ProfileSummaryCard profile={profile} />
                    <Pressable
                        accessibilityRole='button'
                        accessibilityLabel={profile ? 'Continue profile interview' : 'Start profile interview'}
                        onPress={() => router.push('/profile-interview')}
                        style={styles.interviewButton}
                    >
                        <MaterialDesignIcons color='#FFFFFF' name='message-text-outline' size={18} />
                        <Text style={styles.interviewButtonText}>{profile ? 'Continue profile interview' : 'Start profile interview'}</Text>
                    </Pressable>
                    {profile ? <ProfilePreferenceEditor profile={profile} onToggle={handleToggle} /> : <Text style={styles.empty}>Your preferences will appear here after the interview.</Text>}
                    <View style={styles.section}>
                        <Text accessibilityRole='header' accessibilityLevel={2} style={styles.sectionTitle}>
                            Tracked Grocery Stores
                        </Text>
                        <Text style={styles.sectionDescription}>Digital flyers parsed every Wednesday night for current discounts</Text>
                        {canadianStores.map((store) => (
                            <View key={store.name} style={styles.storeRow}>
                                <View><Text style={styles.storeName}>{store.name}</Text><Text style={styles.storeStatus}>{store.status}</Text></View>
                                <Text style={styles.storeDistance}>{store.distance}</Text>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            </SafeAreaView>
        </>
    );
}

const styles = StyleSheet.create({
    content: { alignSelf: 'center', maxWidth: 760, paddingBottom: 32, paddingHorizontal: 20, paddingTop: 12, width: '100%' },
    empty: { color: '#717171', fontSize: 13, marginBottom: 24 },
    interviewButton: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 10, flexDirection: 'row', justifyContent: 'center', marginBottom: 24, padding: 13 },
    interviewButtonText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', marginLeft: 7 },
    safeArea: { backgroundColor: '#FFFFFF', flex: 1 },
    section: { marginTop: 8 },
    sectionDescription: { color: '#717171', fontSize: 12, marginBottom: 12 },
    sectionTitle: { color: '#222222', fontSize: 16, fontWeight: '700', marginBottom: 6 },
    storeDistance: { color: '#717171', fontSize: 12, fontWeight: '600' },
    storeName: { color: '#222222', fontSize: 14, fontWeight: '700' },
    storeRow: { alignItems: 'center', borderBottomColor: '#F2F2F2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 12 },
    storeStatus: { color: '#008A05', fontSize: 11, marginTop: 1 },
    subtitle: { color: '#717171', fontSize: 13, marginBottom: 18, marginTop: 2 },
    title: { color: '#222222', fontSize: 24, fontWeight: '800' }
});
