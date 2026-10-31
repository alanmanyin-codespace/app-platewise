import { describe, expect, it, vi } from 'vitest';
const { saveProfile } = vi.hoisted(() => ({ saveProfile: vi.fn() }));
vi.mock('./profileStorage', () => ({ saveProfile }));
import { completeInterviewForUser } from './completeInterview';

describe('completing a pending interview', () => {
    it('saves the collected answers to the authenticated user', async () => {
        saveProfile.mockResolvedValueOnce(undefined);
        const result = await completeInterviewForUser({ displayName: 'Alex', allergies: ['Peanuts'], onboardingComplete: true }, 'user-123');
        expect(result).toMatchObject({ id: 'user-123', displayName: 'Alex', allergies: ['Peanuts'], onboardingComplete: true });
        expect(saveProfile).toHaveBeenCalledWith(result);
    });
    it('propagates save failures so the pending answers are not discarded', async () => {
        saveProfile.mockRejectedValueOnce(new Error('offline'));
        await expect(completeInterviewForUser({ onboardingComplete: true }, 'user-123')).rejects.toThrow('offline');
    });
});
