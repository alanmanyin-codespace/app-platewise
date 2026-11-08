import { useAtom } from '@/lib/useAtom';
import { ProfileAccessGate } from '@/components/ProfileAccessGate';
import { ProfileSignInDialog } from '@/components/ProfileSignInDialog';
import { clearPendingInterview, getPendingInterview, savePendingInterview } from '@/logic/profile/pendingInterview';
import { completeInterviewForUser } from '@/logic/profile/completeInterview';
import { authErrorAtom, authReadyAtom, authSessionAtom } from '@/logic/auth/authState';
import { theme } from '@/lib/theme';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { PROFILE_ROUTE } from '@/logic/profile/interview';
import { applyProfileOption, getInterviewProfile, initialSelections, keepHiddenValues, parseHouseholdSize, type ProfileOptionField } from '@/logic/profile/profileSetup';
import {
    clampPageIndex,
    getInterviewSteps,
    isWizardStepAnswered,
    PROFILE_WIZARD_GROUPS,
    PROFILE_WIZARD_STEPS,
    type ProfileWizardStep
} from '@/logic/profile/profileWizard';
import { loadProfile, saveProfile } from '@/logic/profile/profileStorage';
import { applyProfilePatch, createProfile, profileAtom, profileHydratedAtom } from '@/logic/profile/profileState';
import type { Profile, ProfilePatch } from '@/logic/profile/types';
import { MaterialDesignIcons } from '@react-native-vector-icons/material-design-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { AccessibilityInfo, Alert, Animated, Easing, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, useWindowDimensions, View } from 'react-native';
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

const emptySelections = initialSelections(null, PROFILE_WIZARD_STEPS);
const DIET_OPTIONS = PROFILE_WIZARD_STEPS.find((step) => step.field === 'dietaryPreferences')?.options ?? [];

export default function ProfileInterview() {
    const [ready] = useAtom(authReadyAtom);
    const [session] = useAtom(authSessionAtom);
    const [hydrated, setHydrated] = useAtom(profileHydratedAtom);
    const [authError, setAuthError] = useAtom(authErrorAtom);
    const [accountProfile, setProfile] = useAtom(profileAtom);
    const [, setAllergyFilters] = useAtom(allergyFiltersAtom);
    const [pending, setPending] = useState<ProfilePatch | null>(() => getPendingInterview());
    const [dialogOpen, setDialogOpen] = useState(false);
    const [completionError, setCompletionError] = useState(false);
    const [attempt, setAttempt] = useState(0);
    const [retryingLoad, setRetryingLoad] = useState(false);
    const completing = useRef(false);

    useEffect(() => {
        if (!pending || !ready || !hydrated || !session || completing.current) return;
        completing.current = true;
        completeInterviewForUser(pending, session.user.id, accountProfile).then((accountProfile) => {
            clearPendingInterview();
            setProfile(accountProfile);
            setAllergyFilters(accountProfile.allergies);
            setDialogOpen(false);
            router.replace(PROFILE_ROUTE);
        }).catch(() => {
            completing.current = false;
            setCompletionError(true);
        });
    }, [pending, ready, hydrated, session, accountProfile, setProfile, setAllergyFilters, attempt]);

    function requestSignIn(patch: ProfilePatch) {
        savePendingInterview(patch);
        setPending(patch);
        setDialogOpen(true);
    }

    function closeSignIn() {
        if (!session) {
            clearPendingInterview();
            setPending(null);
        }
        setDialogOpen(false);
    }

    async function retryProfileLoad() {
        if (!session || retryingLoad) return;
        setRetryingLoad(true);
        try {
            const accountProfile = await loadProfile();
            if (!accountProfile || accountProfile.id !== session.user.id) throw new Error('Account changed');
            setProfile(accountProfile);
            setAllergyFilters(accountProfile.allergies);
            setAuthError(null);
            setHydrated(true);
        } catch {
            setAuthError('Unable to load your profile. Check your connection and try again.');
        } finally { setRetryingLoad(false); }
    }

    let content;
    if (ready && pending && session && !hydrated && authError) {
        content = <SafeAreaView style={styles.safeArea}><Text>Could not load your account. Your answers are still available.</Text><Pressable accessibilityRole='button' disabled={retryingLoad} onPress={retryProfileLoad}><Text style={styles.close}>{retryingLoad ? 'Trying again…' : 'Try again'}</Text></Pressable></SafeAreaView>;
    } else if (!ready || (pending && session && !completionError)) {
        content = <SafeAreaView style={styles.safeArea}><Text>Loading profile…</Text></SafeAreaView>;
    } else if (completionError) {
        content = <SafeAreaView style={styles.safeArea}><Text>Could not save your profile. Your answers are still available; please try again.</Text><Pressable accessibilityRole='button' onPress={() => { setCompletionError(false); setAttempt((value) => value + 1); }}><Text style={styles.close}>Try again</Text></Pressable></SafeAreaView>;
    } else if (session) {
        content = <ProfileAccessGate><ProfileInterviewContent onRequireSignIn={requestSignIn} /></ProfileAccessGate>;
    } else {
        content = <ProfileInterviewContent onRequireSignIn={requestSignIn} />;
    }

    return <>{content}{dialogOpen && <ProfileSignInDialog onClose={closeSignIn} onAuthenticated={() => setDialogOpen(false)} />}</>;
}

function ProfileInterviewContent({ onRequireSignIn }: { onRequireSignIn: (patch: ProfilePatch) => void }) {
    const [profile] = useAtom(profileAtom);
    const [hydrated] = useAtom(profileHydratedAtom);
    const { mode } = useLocalSearchParams<{ mode?: string }>();
    if (!hydrated) return <SafeAreaView style={styles.safeArea}><Text>Loading profile…</Text></SafeAreaView>;
    return <InterviewForm key={`${mode ?? 'create'}-${profile?.id ?? 'guest'}`} initialProfile={getInterviewProfile(profile, mode)} creating={mode !== 'edit'} onRequireSignIn={onRequireSignIn} />;
}

function InterviewForm({ initialProfile, creating, onRequireSignIn }: { initialProfile: Profile | null; creating: boolean; onRequireSignIn: (patch: ProfilePatch) => void }) {
    const [profile, setProfile] = useAtom(profileAtom);
    const [session] = useAtom(authSessionAtom);
    const [, setAllergyFilters] = useAtom(allergyFiltersAtom);
    const [hydrated] = useAtom(profileHydratedAtom);
    const [displayName, setDisplayName] = useState(initialProfile?.displayName ?? '');
    const [selections, setSelections] = useState<Record<ProfileOptionField, string[]>>(() => initialProfile ? initialSelections(initialProfile, PROFILE_WIZARD_STEPS) : emptySelections);
    const [pageIndex, setPageIndex] = useState(0);
    const [saving, setSaving] = useState(false);
    const [saveError, setSaveError] = useState('');
    const { width } = useWindowDimensions();
    const grouped = Platform.OS === 'web' && width >= GROUPED_MIN_WIDTH;

    const pages = useMemo<WizardPage[]>(() => {
        const steps = getInterviewSteps(creating);
        if (grouped) {
            return PROFILE_WIZARD_GROUPS.map((group) => ({
                key: group.id,
                label: group.label,
                description: group.description,
                steps: steps.filter((step) => step.group === group.id)
            }));
        }
        return steps.map((step) => ({
            key: step.field,
            label: step.label,
            description: step.description,
            steps: [step]
        }));
    }, [grouped, creating]);

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
            ...(!creating && { displayName }),
            householdSize: parseHouseholdSize(selections.householdSize[0]),
            cuisines: selections.cuisines,
            proteins: selections.proteins,
            dislikedIngredients: selections.dislikedIngredients,
            allergies: selections.allergies,
            dietaryPreferences: keepHiddenValues(initialProfile?.dietaryPreferences ?? [], selections.dietaryPreferences, DIET_OPTIONS),
            preferredStores: selections.preferredStores,
            onboardingComplete: true
        };
        if (!session) {
            try { onRequireSignIn(patch); setSaveError(''); }
            catch { setSaveError('Could not prepare sign-in. Please try again.'); }
            setSaving(false);
            return;
        }
        const freshProfile = creating ? createProfile(patch) : null;
        const updatedProfile = freshProfile ? { ...freshProfile, id: profile?.id ?? freshProfile.id, displayName: profile?.displayName ?? freshProfile.displayName } : profile ? applyProfilePatch(profile, patch) : createProfile(patch);
        try { await saveProfile(updatedProfile); } catch { setSaving(false); Alert.alert('Could not save profile', 'Please check your connection and try again.'); return; }
        setProfile(updatedProfile);
        setAllergyFilters(updatedProfile.allergies);
        setSaving(false);
        router.replace(session ? PROFILE_ROUTE : '/');
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
                    accessibilityLabel={session ? 'Close setup and return to your profile' : 'Close setup and return home'}
                    onPress={() => router.replace(session ? PROFILE_ROUTE : '/')}
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
                    <InterviewProgress step={currentPage + 1} total={pages.length} />
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
                    {!!saveError && <Text accessibilityRole='alert' style={styles.requirement}>{saveError}</Text>}
                    <View style={styles.navigation}>
                        <Pressable accessibilityRole='button' disabled={currentPage === 0} onPress={goBack} style={[styles.backButton, currentPage === 0 && styles.disabledButton]}>
                            <Text style={[styles.backText, currentPage === 0 && styles.disabledText]}>Back</Text>
                        </Pressable>
                        <Pressable
                            accessibilityRole='button'
                            disabled={saving || !hydrated || !canAdvance}
                            onPress={isLastPage ? saveSetup : goNext}
                            style={[styles.nextButton, (saving || !canAdvance) && styles.disabledNextButton]}
                        >
                            <Text style={styles.nextText}>{saving ? 'Saving…' : isLastPage ? 'Create profile' : 'Next'}</Text>
                        </Pressable>
                    </View>
                    <Text style={styles.editHint}>You can change these preferences later.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

function InterviewProgress({ step, total }: { step: number; total: number }) {
    const percentage = (step / total) * 100;
    const [progress] = useState(() => new Animated.Value(percentage));
    const [reduceMotion, setReduceMotion] = useState(true);

    useEffect(() => {
        let active = true;
        AccessibilityInfo.isReduceMotionEnabled().then((enabled) => {
            if (active) setReduceMotion(enabled);
        }).catch(() => {});
        const subscription = AccessibilityInfo.addEventListener('reduceMotionChanged', setReduceMotion);
        return () => { active = false; subscription.remove(); };
    }, []);

    useEffect(() => {
        progress.stopAnimation();
        if (reduceMotion) {
            progress.setValue(percentage);
            return;
        }
        const animation = Animated.timing(progress, {
            toValue: percentage,
            duration: 350,
            easing: Easing.out(Easing.cubic),
            useNativeDriver: false
        });
        animation.start();
        return () => animation.stop();
    }, [percentage, progress, reduceMotion]);

    const width = progress.interpolate({ inputRange: [0, 100], outputRange: ['0%', '100%'] });
    return <View accessibilityRole='progressbar' accessibilityLabel='Profile setup progress' accessibilityValue={{ min: 0, max: total, now: step }} style={styles.progressTrack}>
        <Animated.View style={[styles.progressFill, { width }]} />
    </View>;
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
