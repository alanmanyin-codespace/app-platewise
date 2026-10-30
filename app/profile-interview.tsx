import { useAtom } from '@/lib/useAtom';
import { theme } from '@/lib/theme';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { PROFILE_ROUTE } from '@/logic/profile/interview';
import { applyProfileOption, type ProfileOptionField } from '@/logic/profile/profileSetup';
import {
    clampPageIndex,
    getStepsInGroup,
    isWizardStepAnswered,
    PROFILE_WIZARD_GROUPS,
    PROFILE_WIZARD_STEPS,
    type ProfileWizardStep
} from '@/logic/profile/profileWizard';
import { loadProfile, saveProfile } from '@/logic/profile/profileStorage';
import { applyProfilePatch, createProfile, profileAtom, profileHydratedAtom } from '@/logic/profile/profileState';
import type { ProfilePatch } from '@/logic/profile/types';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

/**
 * Above this width the seven steps collapse into three themed pages. One
 * question per screen is right on a phone; on a desktop it leaves most of the
 * viewport empty and turns setup into seven rounds of clicking Next.
 */
const GROUPED_MIN_WIDTH = 1024;

type WizardPage = {
    key: string;
    label: string;
    description: string;
    steps: ProfileWizardStep[];
};

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
    const [pageIndex, setPageIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const { width } = useWindowDimensions();
    const grouped = Platform.OS === 'web' && width >= GROUPED_MIN_WIDTH;

    const pages = useMemo<WizardPage[]>(() => {
        if (grouped) {
            return PROFILE_WIZARD_GROUPS.map((group) => ({
                key: group.id,
                label: group.label,
                description: group.description,
                steps: getStepsInGroup(group.id)
            }));
        }
        return PROFILE_WIZARD_STEPS.map((step) => ({
            key: step.field,
            label: step.label,
            description: step.description,
            steps: [step]
        }));
    }, [grouped]);

    // Derived rather than stored, so resizing across the breakpoint mid-setup
    // lands on a page that exists instead of an index past the end.
    const currentPage = clampPageIndex(pageIndex, pages.length);
    const page = pages[currentPage];
    const isLastPage = currentPage === pages.length - 1;

    function valuesForStep(step: ProfileWizardStep): string[] {
        if (step.field === 'displayName') {
            return displayName.trim() ? [displayName] : [];
        }
        return selections[step.field];
    }

    const unanswered = page.steps.filter((step) => !isWizardStepAnswered(step, valuesForStep(step)));
    const canAdvance = unanswered.length === 0;

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

    const progressWidth = `${((currentPage + 1) / pages.length) * 100}%`;

    function toggleOption(field: ProfileOptionField, option: string) {
        setSelections((current) => ({
            ...current,
            [field]: applyProfileOption(field, current[field], option)
        }));
    }

    function goBack() {
        setPageIndex(clampPageIndex(currentPage - 1, pages.length));
    }

    function goNext() {
        setPageIndex(clampPageIndex(currentPage + 1, pages.length));
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
                <Pressable
                    accessibilityRole='button'
                    accessibilityLabel='Close setup and return to your profile'
                    onPress={() => router.replace(PROFILE_ROUTE)}
                    style={styles.closeButton}
                >
                    <Text style={styles.close}>Close</Text>
                </Pressable>
            </View>
            <ScrollView
                contentContainerStyle={[styles.content, grouped && styles.contentGrouped]}
                keyboardShouldPersistTaps='handled'
            >
                <View style={styles.wizardShell}>
                    <View style={styles.progressHeader}>
                        <Text style={styles.stepCount}>STEP {currentPage + 1} OF {pages.length}</Text>
                        <Text style={styles.stepLabel}>{page.label}</Text>
                    </View>
                    <View style={styles.progressTrack}><View style={[styles.progressFill, { width: progressWidth }]} /></View>
                    <View style={styles.questionCard}>
                        <Text accessibilityRole='header' accessibilityLevel={2} style={styles.question}>
                            {page.label}
                        </Text>
                        <Text style={styles.description}>{page.description}</Text>
                        {page.steps.map((step, index) => {
                            const values = valuesForStep(step);
                            return (
                                <View
                                    key={step.field}
                                    style={[styles.field, index > 0 && styles.fieldSpaced]}
                                >
                                    {page.steps.length > 1 && (
                                        <>
                                            <Text style={styles.fieldLabel}>{step.label}</Text>
                                            <Text style={styles.fieldDescription}>{step.description}</Text>
                                        </>
                                    )}
                                    {step.field === 'displayName' ? (
                                        <TextInput
                                            accessibilityLabel='Your name'
                                            autoFocus={!grouped}
                                            onChangeText={setDisplayName}
                                            placeholder='Your name (optional)'
                                            placeholderTextColor='#9A9188'
                                            style={styles.nameInput}
                                            value={displayName}
                                        />
                                    ) : (
                                        <View style={styles.options}>
                                            {step.options?.map((option) => {
                                                const selected = values.includes(option);
                                                return (
                                                    <Pressable
                                                        accessibilityRole='button'
                                                        aria-pressed={selected}
                                                        accessibilityLabel={`${step.label}: ${option}`}
                                                        key={option}
                                                        onPress={() => step.field !== 'displayName' && toggleOption(step.field, option)}
                                                        style={[styles.option, selected && styles.optionSelected]}
                                                    >
                                                        {selected && (
                                                            <MaterialDesignIcons
                                                                color='#FFFFFF'
                                                                name='check'
                                                                size={16}
                                                                style={styles.optionCheck}
                                                            />
                                                        )}
                                                        <Text style={[styles.optionText, selected && styles.optionTextSelected]}>
                                                            {option}
                                                        </Text>
                                                    </Pressable>
                                                );
                                            })}
                                        </View>
                                    )}
                                    {step.multiSelect && (
                                        <Text style={styles.helper}>You can choose more than one.</Text>
                                    )}
                                </View>
                            );
                        })}
                    </View>
                    {!canAdvance && (
                        <Text style={styles.requirement}>
                            {unanswered.length === 1
                                ? `Choose an option for ${unanswered[0].label.toLowerCase()} to continue.`
                                : `Choose an option for ${unanswered.length} more questions to continue.`}
                        </Text>
                    )}
                    <View style={styles.navigation}>
                        <Pressable accessibilityRole='button' disabled={currentPage === 0} onPress={goBack} style={[styles.backButton, currentPage === 0 && styles.disabledButton]}>
                            <Text style={[styles.backText, currentPage === 0 && styles.disabledText]}>Back</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole='button'
                            disabled={saving || !canAdvance}
                            onPress={isLastPage ? saveSetup : goNext}
                            style={[styles.nextButton, (saving || !canAdvance) && styles.disabledNextButton]}
                        >
                            <Text style={styles.nextText}>{saving ? 'Saving…' : isLastPage ? 'Create profile' : 'Next'}</Text>
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
    backButton: { alignItems: 'center', borderColor: '#DED8D0', borderRadius: 12, borderWidth: 1, justifyContent: 'center', marginRight: 10, minHeight: 48, paddingHorizontal: 26 },
    backText: { color: '#26352F', fontSize: 14, fontWeight: '700' },
    close: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
    closeButton: { alignItems: 'center', justifyContent: 'center', marginRight: -10, minHeight: 44, minWidth: 44, paddingHorizontal: 10 },
    content: { alignItems: 'center', backgroundColor: theme.colors.canvas, flexGrow: 1, justifyContent: 'center', padding: 18 },
    contentGrouped: { justifyContent: 'flex-start', paddingBottom: 48, paddingTop: 32 },
    description: { color: '#716A63', fontSize: 15, lineHeight: 22, marginBottom: 24, textAlign: 'center' },
    field: { width: '100%' },
    fieldDescription: { color: '#716A63', fontSize: 13, lineHeight: 19, marginBottom: 14 },
    fieldLabel: { color: '#26352F', fontSize: 15, fontWeight: '700', marginBottom: 4 },
    fieldSpaced: { borderTopColor: '#F0ECE6', borderTopWidth: 1, marginTop: 28, paddingTop: 24 },
    disabledButton: { backgroundColor: '#F3F0EC', borderColor: '#F3F0EC' },
    disabledNextButton: { backgroundColor: '#A8BDB4' },
    disabledText: { color: '#B4ADA5' },
    editHint: { color: '#8A8178', fontSize: 12, marginTop: 18, textAlign: 'center' },
    eyebrow: { color: '#8A8178', fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
    header: { alignItems: 'center', backgroundColor: '#FFFFFF', borderBottomColor: '#EEE9E2', borderBottomWidth: 1, flexDirection: 'row', justifyContent: 'space-between', padding: 18 },
    helper: { color: '#8A8178', fontSize: 12, marginTop: 12, textAlign: 'center' },
    nameInput: { backgroundColor: '#FFFFFF', borderColor: '#DED8D0', borderRadius: 12, borderWidth: 1, color: '#26352F', fontSize: 16, padding: 14, width: '100%' },
    navigation: { flexDirection: 'row', marginTop: 28 },
    nextButton: { alignItems: 'center', backgroundColor: theme.colors.primary, borderRadius: 12, flex: 1, justifyContent: 'center', minHeight: 48, padding: 14 },
    nextText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
    option: { alignItems: 'center', backgroundColor: '#FFFFFF', borderColor: '#DED8D0', borderRadius: 22, borderWidth: 1, flexDirection: 'row', justifyContent: 'center', marginBottom: 10, marginHorizontal: 4, minHeight: 48, minWidth: 64, paddingHorizontal: 18, paddingVertical: 12 },
    optionCheck: { marginRight: 6 },
    optionSelected: { backgroundColor: theme.colors.primary, borderColor: theme.colors.primary },
    optionText: { color: '#26352F', fontSize: 15, fontWeight: '600' },
    optionTextSelected: { color: '#FFFFFF' },
    options: { alignItems: 'center', flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center' },
    progressFill: { backgroundColor: theme.colors.primary, borderRadius: 4, height: 6 },
    progressHeader: { alignItems: 'center', marginBottom: 12 },
    progressTrack: { backgroundColor: '#E4DED6', borderRadius: 4, height: 6, overflow: 'hidden', width: '100%' },
    question: { color: '#26352F', fontSize: 27, fontWeight: '800', marginBottom: 10, textAlign: 'center' },
    requirement: { color: '#716A63', fontSize: 13, marginTop: 16, textAlign: 'center' },
    questionCard: { backgroundColor: '#FFFFFF', borderColor: '#EEE9E2', borderRadius: 20, borderWidth: 1, marginTop: 26, padding: 26, width: '100%' },
    safeArea: { backgroundColor: theme.colors.canvas, flex: 1 },
    stepCount: { color: theme.colors.primary, fontSize: 11, fontWeight: '800', letterSpacing: 1 },
    stepLabel: { color: '#8A8178', fontSize: 13, marginTop: 4 },
    title: { color: '#26352F', fontSize: 22, fontWeight: '800', marginTop: 3 },
    wizardShell: { maxWidth: 680, width: '100%' }
});
