import { useAtom } from '@/lib/useAtom';
import {
    applyInterviewAnswer,
    createInitialInterviewState,
    PROFILE_ROUTE,
    type InterviewTopic
} from '@/logic/profile/interview';
import { loadProfile, saveProfile } from '@/logic/profile/profileStorage';
import {
    applyProfilePatch,
    createProfile,
    profileAtom,
    profileHydratedAtom
} from '@/logic/profile/profileState';
import { router } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { ElementRef } from 'react';
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const quickOptions: Partial<Record<InterviewTopic, string[]>> = {
    household: ['1', '2', '3', '4+'],
    savings: ['Lower my weekly bill', 'Find more flyer deals', 'Plan within a budget'],
    allergies: ['Peanuts', 'Tree Nuts', 'Dairy', 'Gluten', 'None'],
    diet: ['Vegetarian', 'High protein', 'Low carb', 'No preference'],
    mealPlanning: ['A few dinners', 'The whole week', 'Quick meals', 'Batch cooking'],
    stores: ['Metro', 'No Frills', 'FreshCo', 'Walmart', 'Food Basics'],
    confirmation: ['Yes', 'Not yet']
};

export default function ProfileInterview() {
    const [profile, setProfile] = useAtom(profileAtom);
    const [, setHydrated] = useAtom(profileHydratedAtom);
    const [interview, setInterview] = useState(() => createInitialInterviewState());
    const [input, setInput] = useState('');
    const [selectedOptions, setSelectedOptions] = useState<string[]>([]);
    const scrollRef = useRef<ElementRef<typeof ScrollView>>(null);

    useEffect(() => {
        loadProfile().then((storedProfile) => {
            if (storedProfile) {
                setProfile(storedProfile);
                setInterview(createInitialInterviewState(storedProfile));
            }
            setHydrated(true);
        });
    }, [setHydrated, setProfile]);

    const options = useMemo(() => quickOptions[interview.topic] ?? [], [interview.topic]);

    function toggleOption(option: string) {
        if (interview.topic === 'household' || interview.topic === 'savings' || interview.topic === 'confirmation') {
            setSelectedOptions([option]);
            return;
        }

        setSelectedOptions((current) =>
            current.includes(option) ? current.filter((value) => value !== option) : [...current, option]
        );
    }

    async function submitAnswer(value: string | string[]) {
        const nextInterview = applyInterviewAnswer(interview, value);
        const nextProfile = profile
            ? applyProfilePatch(profile, nextInterview.answers)
            : createProfile(nextInterview.answers);

        setInterview(nextInterview);
        setProfile(nextProfile);
        setInput('');
        setSelectedOptions([]);
        await saveProfile(nextProfile);
        requestAnimationFrame(() => scrollRef.current?.scrollToEnd({ animated: true }));
    }

    const answer = selectedOptions.length ? selectedOptions : input.trim();
    const canSubmit = Array.isArray(answer) ? answer.length > 0 : answer.length > 0;

    return (
        <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
                style={styles.flex}
            >
                <View style={styles.header}>
                    <View>
                        <Text style={styles.eyebrow}>SAVINGS PROFILE</Text>
                        <Text style={styles.title}>Let&apos;s get to know you</Text>
                    </View>
                    <Pressable onPress={() => router.replace(PROFILE_ROUTE)}>
                        <Text style={styles.close}>Close</Text>
                    </Pressable>
                </View>
                <ScrollView
                    ref={scrollRef}
                    contentContainerStyle={styles.messages}
                    keyboardShouldPersistTaps='handled'
                    onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: false })}
                >
                    {interview.messages.map((message) => (
                        <View
                            key={message.id}
                            style={message.role === 'user' ? styles.userRow : styles.assistantRow}
                        >
                            {message.role === 'assistant' && <Text style={styles.avatar}>A</Text>}
                            <View style={message.role === 'user' ? styles.userBubble : styles.assistantBubble}>
                                <Text style={message.role === 'user' ? styles.userText : styles.assistantText}>
                                    {message.text}
                                </Text>
                            </View>
                        </View>
                    ))}
                    <View style={styles.options}>
                        {options.map((option) => (
                            <Pressable
                                key={option}
                                onPress={() => toggleOption(option)}
                                style={[
                                    styles.option,
                                    selectedOptions.includes(option) && styles.optionSelected
                                ]}
                            >
                                <Text
                                    style={[
                                        styles.optionText,
                                        selectedOptions.includes(option) && styles.optionTextSelected
                                    ]}
                                >
                                    {option}
                                </Text>
                            </Pressable>
                        ))}
                    </View>
                </ScrollView>
                <View style={styles.composer}>
                    <TextInput
                        onChangeText={setInput}
                        onSubmitEditing={() => canSubmit && submitAnswer(answer)}
                        placeholder='Type a reply…'
                        placeholderTextColor='#9A9188'
                        style={styles.input}
                        value={input}
                    />
                    <Pressable
                        disabled={!canSubmit}
                        onPress={() => submitAnswer(answer)}
                        style={[styles.send, !canSubmit && styles.sendDisabled]}
                    >
                        <Text style={styles.sendText}>Send</Text>
                    </Pressable>
                </View>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    assistantBubble: {
        backgroundColor: '#EEF5F1',
        borderRadius: 4,
        borderBottomRightRadius: 16,
        borderTopRightRadius: 16,
        maxWidth: '82%',
        padding: 13
    },
    assistantText: { color: '#26352F', fontSize: 15, lineHeight: 21 },
    assistantRow: { alignItems: 'flex-start', flexDirection: 'row', gap: 10, marginBottom: 16 },
    avatar: {
        alignItems: 'center',
        backgroundColor: '#2D6A5B',
        borderRadius: 17,
        color: '#FFFFFF',
        fontSize: 15,
        height: 34,
        paddingTop: 7,
        textAlign: 'center',
        width: 34
    },
    close: { color: '#2D6A5B', fontSize: 13, fontWeight: '700' },
    composer: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderTopColor: '#EEE9E2',
        borderTopWidth: 1,
        flexDirection: 'row',
        gap: 8,
        padding: 14
    },
    eyebrow: { color: '#8A8178', fontSize: 11, fontWeight: '700', letterSpacing: 1.1 },
    flex: { flex: 1 },
    header: {
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderBottomColor: '#EEE9E2',
        borderBottomWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 18
    },
    input: {
        borderColor: '#DED8D0',
        borderRadius: 22,
        borderWidth: 1,
        color: '#26352F',
        flex: 1,
        fontSize: 15,
        paddingHorizontal: 15,
        paddingVertical: 10
    },
    messages: { backgroundColor: '#F8F7F5', flexGrow: 1, padding: 18 },
    option: {
        backgroundColor: '#FFFFFF',
        borderColor: '#DED8D0',
        borderRadius: 20,
        borderWidth: 1,
        marginBottom: 8,
        marginRight: 8,
        paddingHorizontal: 14,
        paddingVertical: 10
    },
    optionSelected: { backgroundColor: '#2D6A5B', borderColor: '#2D6A5B' },
    optionText: { color: '#26352F', fontSize: 13, fontWeight: '600' },
    optionTextSelected: { color: '#FFFFFF' },
    options: { flexDirection: 'row', flexWrap: 'wrap', marginLeft: 44, marginTop: 2 },
    safeArea: { backgroundColor: '#F8F7F5', flex: 1 },
    send: { backgroundColor: '#2D6A5B', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 11 },
    sendDisabled: { backgroundColor: '#B7C8C1' },
    sendText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700' },
    title: { color: '#26352F', fontSize: 22, fontWeight: '800', marginTop: 3 },
    userBubble: { backgroundColor: '#2D6A5B', borderRadius: 16, borderBottomRightRadius: 4, maxWidth: '82%', padding: 13 },
    userRow: { alignItems: 'flex-end', flexDirection: 'row', justifyContent: 'flex-end', marginBottom: 16 },
    userText: { color: '#FFFFFF', fontSize: 15, lineHeight: 21 }
});
