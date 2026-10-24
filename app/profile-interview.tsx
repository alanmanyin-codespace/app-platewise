import { useAtom } from '@/lib/useAtom';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { PROFILE_ROUTE } from '@/logic/profile/interview';
import { applyProfileOption, type ProfileOptionField } from '@/logic/profile/profileSetup';
import { loadProfile, saveProfile } from '@/logic/profile/profileStorage';
import { applyProfilePatch, createProfile, profileAtom, profileHydratedAtom } from '@/logic/profile/profileState';
import type { ProfilePatch } from '@/logic/profile/types';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type OptionGroup = {
    field: ProfileOptionField;
    label: string;
    description: string;
    options: string[];
    multiSelect?: boolean;
};

const optionGroups: OptionGroup[] = [
    { field: 'householdSize', label: 'Household size', description: 'How many people do you usually shop for?', options: ['1', '2', '3', '4+'] },
    { field: 'savingsGoal', label: 'Savings goal', description: 'What would make your grocery trips better?', options: ['Lower my weekly bill', 'Find more flyer deals', 'Plan within a budget'] },
    { field: 'allergies', label: 'Allergies to avoid', description: 'We will keep these ingredients out of recipe suggestions.', options: ['None', 'Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'Shellfish', 'Soy', 'Eggs'], multiSelect: true },
    { field: 'dietaryPreferences', label: 'Dietary preferences', description: 'Choose all that fit, or select no preference.', options: ['No preference', 'Vegetarian', 'High protein', 'Low carb'], multiSelect: true },
    { field: 'mealPlanningPreferences', label: 'Meal planning', description: 'What kind of planning support would help most?', options: ['A few dinners', 'The whole week', 'Quick meals', 'Batch cooking'], multiSelect: true },
    { field: 'preferredStores', label: 'Preferred stores', description: 'Pick the stores you want us to prioritize.', options: ['Metro', 'No Frills', 'FreshCo', 'Walmart', 'Food Basics'], multiSelect: true }
];

const emptySelections: Record<ProfileOptionField, string[]> = {
    householdSize: [], savingsGoal: [], allergies: [], dietaryPreferences: [], mealPlanningPreferences: [], preferredStores: []
};

export default function ProfileInterview() {
    const [profile, setProfile] = useAtom(profileAtom);
    const [, setAllergyFilters] = useAtom(allergyFiltersAtom);
    const [, setHydrated] = useAtom(profileHydratedAtom);
    const [displayName, setDisplayName] = useState('');
    const [selections, setSelections] = useState(emptySelections);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadProfile().then((storedProfile) => {
            if (storedProfile) {
                setProfile(storedProfile);
                setDisplayName(storedProfile.displayName);
                setSelections({
                    householdSize: storedProfile.householdSize ? [formatHouseholdSize(storedProfile.householdSize)] : [],
                    savingsGoal: storedProfile.savingsGoal ? [storedProfile.savingsGoal] : [],
                    allergies: storedProfile.allergies,
                    dietaryPreferences: storedProfile.dietaryPreferences,
                    mealPlanningPreferences: storedProfile.mealPlanningPreferences,
                    preferredStores: storedProfile.preferredStores
                });
            }
            setHydrated(true);
        });
    }, [setHydrated, setProfile]);

    const completedSections = useMemo(
        () => [displayName.trim(), ...Object.values(selections).map((values) => values.length > 0)].filter(Boolean).length,
        [displayName, selections]
    );

    function toggleOption(field: ProfileOptionField, option: string) {
        setSelections((current) => ({ ...current, [field]: applyProfileOption(field, current[field], option) }));
    }

    async function saveSetup() {
        setSaving(true);
        const patch: ProfilePatch = {
            displayName,
            householdSize: parseHouseholdSize(selections.householdSize[0]),
            savingsGoal: selections.savingsGoal[0],
            allergies: selections.allergies,
            dietaryPreferences: selections.dietaryPreferences,
            mealPlanningPreferences: selections.mealPlanningPreferences,
            preferredStores: selections.preferredStores,
            onboardingComplete: true
        };
        const updatedProfile = profile ? applyProfilePatch(profile, patch) : createProfile(patch);
        setProfile(updatedProfile);
        setAllergyFilters(updatedProfile.allergies);
        await saveProfile(updatedProfile);
        setSaving(false);
        router.replace(PROFILE_ROUTE);
    }

    return (
        <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
            <View style={styles.header}>
                <View><Text style={styles.eyebrow}>SAVINGS PROFILE</Text><Text style={styles.title}>Set up your preferences</Text></View>
                <Pressable accessibilityRole='button' onPress={() => router.replace(PROFILE_ROUTE)}><Text style={styles.close}>Close</Text></Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
                <View style={styles.introCard}>
                    <Text style={styles.introTitle}>Make the Savings Hub work for you</Text>
                    <Text style={styles.introText}>Pick the options that match your household. You can change any of these later.</Text>
                    <Text style={styles.progress}>{completedSections} of 7 sections started</Text>
                </View>
                <View style={styles.section}>
                    <Text style={styles.sectionLabel}>ABOUT YOU</Text>
                    <TextInput accessibilityLabel='Your name' onChangeText={setDisplayName} placeholder='Your name (optional)' placeholderTextColor='#9A9188' style={styles.nameInput} value={displayName} />
                </View>
                {optionGroups.map((group) => (
                    <View key={group.field} style={styles.section}>
                        <Text style={styles.sectionLabel}>{group.label.toUpperCase()}</Text>
                        <Text style={styles.description}>{group.description}</Text>
                        <View style={styles.options}>
                            {group.options.map((option) => {
                                const selected = selections[group.field].includes(option);
                                return (
                                    <Pressable accessibilityRole='button' accessibilityState={{ selected }} key={option} onPress={() => toggleOption(group.field, option)} style={[styles.option, selected && styles.optionSelected]}>
                                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>{selected ? '✓ ' : ''}{option}</Text>
                                    </Pressable>
                                );
                            })}
                        </View>
                        {group.multiSelect && <Text style={styles.helper}>You can choose more than one.</Text>}
                    </View>
                ))}
                <Pressable accessibilityRole='button' disabled={saving} onPress={saveSetup} style={[styles.saveButton, saving && styles.saveButtonDisabled]}>
                    <Text style={styles.saveButtonText}>{saving ? 'Saving…' : 'Save my profile'}</Text>
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

function parseHouseholdSize(value?: string): number | undefined {
    if (!value) return undefined;
    if (value === '4+') return 4;
    const parsed = Number(value);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

function formatHouseholdSize(value: number): string {
    return value >= 4 ? '4+' : String(value);
}

const styles = StyleSheet.create({
    close: { color: '#2D6A5B', fontSize: 13, fontWeight: '700' },
    content: { backgroundColor: '#F8F7F5', padding: 18, paddingBottom: 38 },
    description: { color: '#716A63', fontSize: 13, lineHeight: 18, marginBottom: 10 },
    eyebrow: { color: '#8A8178', fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
    header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#EEE9E2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
    helper: { color: '#8A8178', fontSize: 11, marginTop: 2 },
    introCard: { backgroundColor: '#EEF5F1', borderRadius: 18, marginBottom: 24, padding: 18 },
    introText: { color: '#476257', fontSize: 14, lineHeight: 20, marginTop: 5 },
    introTitle: { color: '#26352F', fontSize: 18, fontWeight: '800' },
    nameInput: { backgroundColor: '#FFFFFF', borderColor: '#DED8D0', borderRadius: 12, borderWidth: 1, color: '#26352F', fontSize: 15, padding: 13 },
    option: { backgroundColor: '#FFFFFF', borderColor: '#DED8D0', borderRadius: 18, borderWidth: 1, marginBottom: 8, marginRight: 8, paddingHorizontal: 14, paddingVertical: 10 },
    optionSelected: { backgroundColor: '#2D6A5B', borderColor: '#2D6A5B' },
    optionText: { color: '#26352F', fontSize: 13, fontWeight: '600' },
    optionTextSelected: { color: '#FFFFFF' },
    options: { flexDirection: 'row', flexWrap: 'wrap' },
    progress: { color: '#2D6A5B', fontSize: 12, fontWeight: '700', marginTop: 12 },
    safeArea: { backgroundColor: '#F8F7F5', flex: 1 },
    saveButton: { alignItems: 'center', backgroundColor: '#2D6A5B', borderRadius: 12, marginTop: 2, padding: 15 },
    saveButtonDisabled: { backgroundColor: '#A8BDB4' },
    saveButtonText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
    section: { marginBottom: 22 },
    sectionLabel: { color: '#8A8178', fontSize: 11, fontWeight: '800', letterSpacing: 1, marginBottom: 7 },
    title: { color: '#26352F', fontSize: 22, fontWeight: '800', marginTop: 3 }
});
