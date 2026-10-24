import { useAtom } from '@/lib/useAtom';
import { theme } from '@/lib/theme';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { PROFILE_ROUTE } from '@/logic/profile/interview';
import { applyProfileOption, type ProfileOptionField } from '@/logic/profile/profileSetup';
import { getNextWizardStep, getPreviousWizardStep, PROFILE_WIZARD_STEPS } from '@/logic/profile/profileWizard';
import { loadProfile, saveProfile } from '@/logic/profile/profileStorage';
import { applyProfilePatch, createProfile, profileAtom, profileHydratedAtom } from '@/logic/profile/profileState';
import type { ProfilePatch } from '@/logic/profile/types';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const emptySelections: Record<ProfileOptionField, string[]> = {
    householdSize: [],
    savingsGoal: [],
    allergies: [],
    dietaryPreferences: [],
    mealPlanningPreferences: [],
    preferredStores: []
};

export default function ProfileInterview() {
    const [profile, setProfile] = useAtom(profileAtom);
    const [, setAllergyFilters] = useAtom(allergyFiltersAtom);
    const [, setHydrated] = useAtom(profileHydratedAtom);
    const [displayName, setDisplayName] = useState('');
    const [selections, setSelections] = useState(emptySelections);
    const [stepIndex, setStepIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const step = PROFILE_WIZARD_STEPS[stepIndex];
    const isLastStep = stepIndex === PROFILE_WIZARD_STEPS.length - 1;
    const optionField: ProfileOptionField | undefined = step.field === 'displayName' ? undefined : step.field;
    const selectedValues = optionField ? selections[optionField] : [];

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

    const progressWidth = useMemo(() => `${((stepIndex + 1) / PROFILE_WIZARD_STEPS.length) * 100}%`, [stepIndex]);

    function toggleOption(field: ProfileOptionField, option: string) {
        setSelections((current) => ({
            ...current,
            [field]: applyProfileOption(field, current[field], option)
        }));
    }

    function goBack() {
        setStepIndex((current) => getPreviousWizardStep(current));
    }

    function goNext() {
        setStepIndex((current) => getNextWizardStep(current));
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
                <View>
                    <Text style={styles.eyebrow}>SAVINGS PROFILE</Text>
                    <Text style={styles.title}>Set up your preferences</Text>
                </View>
                <Pressable accessibilityRole='button' onPress={() => router.replace(PROFILE_ROUTE)}>
                    <Text style={styles.close}>Close</Text>
                </Pressable>
            </View>
            <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
                <View style={styles.wizardShell}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.stepCount}>STEP {stepIndex + 1} OF {PROFILE_WIZARD_STEPS.length}</Text>
                        <Text style={styles.stepLabel}>{step.label}</Text>
                    </View>
                    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: progressWidth }]} /></View>
                    <View style={styles.questionCard}>
                        <Text style={styles.question}>{step.label}</Text>
                        <Text style={styles.description}>{step.description}</Text>
                        {step.field === 'displayName' ? (
                            <TextInput
                                accessibilityLabel='Your name'
                                autoFocus
                                onChangeText={setDisplayName}
                                placeholder='Your name (optional)'
                                placeholderTextColor='#9A9188'
                                style={styles.nameInput}
                                value={displayName}
                            />
                        ) : (
                            <View style={styles.options}>
                                {step.options?.map((option) => {
                                    const selected = selectedValues.includes(option);
                                    return (
                                        <Pressable
                                            accessibilityRole='button'
                                            accessibilityState={{ selected }}
                                            key={option}
                                            onPress={() => optionField && toggleOption(optionField, option)}
                                            style={[styles.option, selected && styles.optionSelected]}
                                        >
                                            <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                                                {selected ? '✓ ' : ''}{option}
                                            </Text>
                                        </Pressable>
                                    );
                                })}
                            </View>
                        )}
                        {step.multiSelect && <Text style={styles.helper}>You can choose more than one.</Text>}
                    </View>
                    <View style={styles.navigation}>
                        <Pressable accessibilityRole='button' disabled={stepIndex === 0} onPress={goBack} style={[styles.backButton, stepIndex === 0 && styles.disabledButton]}>
                            <Text style={[styles.backText, stepIndex === 0 && styles.disabledText]}>Back</Text>
                        </Pressable>
                        <Pressable accessibilityRole='button' disabled={saving} onPress={isLastStep ? saveSetup : goNext} style={[styles.nextButton, saving && styles.disabledNextButton]}>
                            <Text style={styles.nextText}>{saving ? 'Saving…' : isLastStep ? 'Create profile' : 'Next'}</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.editHint}>You can change these preferences later from your profile.</Text>
                </View>
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
    backButton: { alignItems: 'center', borderColor: '#DED8D0', borderRadius: 12, borderWidth: 1, flex: 1, marginRight: 10, padding: 14 },
    backText: { color: '#26352F', fontSize: 14, fontWeight: '700' },
    close: { color: theme.colors.primary, fontSize: 13, fontWeight: '700' },
    content: { alignItems: 'center', backgroundColor: theme.colors.canvas, flexGrow: 1, justifyContent: 'center', padding: 18 },
    description: { color: '#716A63', fontSize: 15, lineHeight: 22, marginBottom: 24, textAlign: 'center' },
    disabledButton: { backgroundColor: '#F3F0EC', borderColor: '#F3F0EC' },
    disabledNextButton: { backgroundColor: '#A8BDB4' },
    disabledText: { color: '#B4ADA5' },
    editHint: { color: '#8A8178', fontSize: 12, marginTop: 18, textAlign: 'center' },
    eyebrow: { color: '#8A8178', fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
    header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#EEE9E2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
    helper: { color: '#8A8178', fontSize: 12, marginTop: 12, textAlign: 'center' },
    nameInput: { backgroundColor: '#FFFFFF', borderColor: '#DED8D0', borderRadius: 12, borderWidth: 1, color: '#26352F', fontSize: 16, padding: 14, width: '100%' },
    navigation: { flexDirection: 'row', marginTop: 28 },
    nextButton: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 12, flex: 1, padding: 14 },
    nextText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    option: { backgroundColor: '#FFFFFF', borderColor: '#DED8D0', borderRadius: 20, borderWidth: 1, marginBottom: 10, marginHorizontal: 4, paddingHorizontal: 16, paddingVertical: 12 },
    optionSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    optionText: { color: '#26352F', fontSize: 14, fontWeight: '600' },
    optionTextSelected: { color: '#FFFFFF' },
    options: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    progressFill: { backgroundColor: theme.colors.primary, borderRadius: 4, height: 6 },
    progressHeader: { alignItems: 'center', marginBottom: 12 },
    progressTrack: { backgroundColor: '#E4DED6', borderRadius: 4, height: 6, overflow: 'hidden', width: '100%' },
    question: { color: '#26352F', fontSize: 27, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
    questionCard: { backgroundColor: '#FFFFFF', borderColor: '#EEE9E2', borderRadius: 20, borderWidth: 1, marginTop: 26, padding: 26, width: '100%' },
    safeArea: { backgroundColor: theme.colors.canvas, flex: 1 },
    stepCount: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    stepLabel: { color: '#8A8178', fontSize: 13, marginTop: 4 },
    title: { color: '#26352F', fontSize: 22, fontWeight: '800', marginTop: 3 },
    wizardShell: { maxWidth: 680, width: '100%' }
});
