import type { Profile, ProfilePatch } from './types';

export type InterviewTopic =
    | 'name'
    | 'household'
    | 'savings'
    | 'allergies'
    | 'diet'
    | 'mealPlanning'
    | 'stores'
    | 'confirmation';

export type InterviewMessage = {
    id: string;
    role: 'assistant' | 'user';
    text: string;
};

export type InterviewState = {
    topic: InterviewTopic;
    messages: InterviewMessage[];
    answers: ProfilePatch;
};

export const PROFILE_ROUTE = '/profile';

export const INTERVIEW_QUESTIONS: Record<InterviewTopic, string> = {
    name: 'Hi! I can help you find better grocery deals. What should I call you?',
    household: 'Who are you usually planning groceries for? Tell me how many people you shop for.',
    savings: 'What matters most for your grocery savings right now?',
    allergies: 'Which allergies should I keep out of your recipes?',
    diet: 'Do you follow any dietary preferences?',
    mealPlanning: 'How would you like meal planning to fit into your week?',
    stores: 'Which grocery stores do you prefer to shop at?',
    confirmation: 'Here is the profile I have so far. Does this look right?'
};

const topics: InterviewTopic[] = [
    'name',
    'household',
    'savings',
    'allergies',
    'diet',
    'mealPlanning',
    'stores',
    'confirmation'
];

function message(role: InterviewMessage['role'], text: string, index: number): InterviewMessage {
    return { id: `interview-${index}`, role, text };
}

export function nextInterviewTopic(topic: InterviewTopic): InterviewTopic {
    const index = topics.indexOf(topic);
    return topics[Math.min(index + 1, topics.length - 1)];
}

export function createInitialInterviewState(profile?: Profile | null): InterviewState {
    const topic = profile ? firstIncompleteTopic(profile) : 'name';
    return {
        topic,
        messages: [message('assistant', INTERVIEW_QUESTIONS[topic], 0)],
        answers: profile
            ? {
                  displayName: profile.displayName,
                  householdSize: profile.householdSize,
                  savingsGoal: profile.savingsGoal,
                  allergies: profile.allergies,
                  dietaryPreferences: profile.dietaryPreferences,
                  mealPlanningPreferences: profile.mealPlanningPreferences,
                  preferredStores: profile.preferredStores,
                  onboardingComplete: profile.onboardingComplete
              }
            : {}
    };
}

export function applyInterviewAnswer(
    state: InterviewState,
    input: string | string[]
): InterviewState {
    const values = Array.isArray(input)
        ? input.map((value) => value.trim()).filter(Boolean)
        : input.trim();
    const displayValue = Array.isArray(values) ? values.join(', ') : values;
    const answer = answerForTopic(state.topic, values);
    const nextTopic = nextInterviewTopic(state.topic);

    if (state.topic === 'confirmation') {
        const confirmed = displayValue.toLowerCase() === 'yes';
        return {
            ...state,
            answers: { ...state.answers, onboardingComplete: confirmed },
            messages: [
                ...state.messages,
                message('user', displayValue || 'Skip', state.messages.length),
                message(
                    'assistant',
                    confirmed
                        ? 'Thanks — your profile is ready.'
                        : 'No problem. You can keep refining your profile from the Savings Hub.',
                    state.messages.length + 1
                )
            ]
        };
    }

    return {
        topic: nextTopic,
        answers: { ...state.answers, ...answer },
        messages: [
            ...state.messages,
            message('user', displayValue || 'Skip for now', state.messages.length),
            message('assistant', INTERVIEW_QUESTIONS[nextTopic], state.messages.length + 1)
        ]
    };
}

function answerForTopic(
    topic: InterviewTopic,
    value: string | string[]
): ProfilePatch {
    if (topic === 'name') {
        return { displayName: typeof value === 'string' ? value : value[0] ?? '' };
    }
    if (topic === 'household') {
        const householdSize = Number(value);
        return Number.isFinite(householdSize) && householdSize > 0 ? { householdSize } : {};
    }
    if (topic === 'savings') {
        return typeof value === 'string' && value ? { savingsGoal: value } : {};
    }
    if (topic === 'allergies') {
        return { allergies: asList(value) };
    }
    if (topic === 'diet') {
        return { dietaryPreferences: asList(value) };
    }
    if (topic === 'mealPlanning') {
        return { mealPlanningPreferences: asList(value) };
    }
    if (topic === 'stores') {
        return { preferredStores: asList(value) };
    }
    return {};
}

function asList(value: string | string[]): string[] {
    return Array.isArray(value) ? value : value ? [value] : [];
}

function firstIncompleteTopic(profile: Profile): InterviewTopic {
    if (!profile.displayName) return 'name';
    if (!profile.householdSize) return 'household';
    if (!profile.savingsGoal) return 'savings';
    if (!profile.allergies.length) return 'allergies';
    if (!profile.dietaryPreferences.length) return 'diet';
    if (!profile.mealPlanningPreferences.length) return 'mealPlanning';
    if (!profile.preferredStores.length) return 'stores';
    return 'confirmation';
}
