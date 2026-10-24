import { describe, expect, it } from 'vitest';
import {
    applyInterviewAnswer,
    createInitialInterviewState,
    nextInterviewTopic
} from './interview';

describe('profile interview', () => {
    it('starts with a name prompt', () => {
        const state = createInitialInterviewState();

        expect(state.topic).toBe('name');
        expect(state.messages[0]).toMatchObject({ role: 'assistant' });
        expect(state.messages[0].text).toContain('call you');
    });

    it('records a name and advances to the household question', () => {
        const state = applyInterviewAnswer(createInitialInterviewState(), ' Alex ');

        expect(state.topic).toBe('household');
        expect(state.answers.displayName).toBe('Alex');
        expect(state.messages.at(-2)).toMatchObject({ role: 'user', text: 'Alex' });
        expect(state.messages.at(-1)).toMatchObject({ role: 'assistant' });
    });

    it('normalizes a household answer and advances to savings', () => {
        const state = applyInterviewAnswer(
            applyInterviewAnswer(createInitialInterviewState(), 'Alex'),
            '3'
        );

        expect(state.topic).toBe('savings');
        expect(state.answers.householdSize).toBe(3);
    });

    it('records multiple allergy choices together', () => {
        let state = createInitialInterviewState();
        state = { ...state, topic: 'allergies' };

        const next = applyInterviewAnswer(state, ['Dairy', 'Gluten']);

        expect(next.answers.allergies).toEqual(['Dairy', 'Gluten']);
        expect(next.topic).toBe('diet');
    });

    it('skips an optional topic without adding an empty answer', () => {
        let state = createInitialInterviewState();
        state = { ...state, topic: 'savings' };

        const next = applyInterviewAnswer(state, '   ');

        expect(next.topic).toBe('allergies');
        expect(next.answers.savingsGoal).toBeUndefined();
    });

    it('completes the profile after confirmation', () => {
        let state = createInitialInterviewState();
        state = { ...state, topic: 'confirmation' };

        const next = applyInterviewAnswer(state, 'Yes');

        expect(next.topic).toBe('confirmation');
        expect(next.answers.onboardingComplete).toBe(true);
        expect(next.messages.at(-1)?.text).toContain('profile is ready');
    });

    it('advances through the topics in order', () => {
        expect(nextInterviewTopic('name')).toBe('household');
        expect(nextInterviewTopic('stores')).toBe('confirmation');
        expect(nextInterviewTopic('confirmation')).toBe('confirmation');
    });
});
