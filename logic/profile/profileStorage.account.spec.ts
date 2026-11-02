import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createProfile } from './profileState';

const { auth, table, local } = vi.hoisted(() => ({
    auth: { getSession: vi.fn() },
    table: { upsert: vi.fn(), select: vi.fn(), eq: vi.fn(), maybeSingle: vi.fn() },
    local: { getItem: vi.fn(), setItem: vi.fn(), removeItem: vi.fn() }
}));
vi.mock('@react-native-async-storage/async-storage', () => ({ createAsyncStorage: () => local }));
vi.mock('@/logic/auth/supabase', () => ({ supabase: { auth, from: () => table } }));
import { loadProfile, saveProfile } from './profileStorage';

describe('account profile persistence', () => {
    beforeEach(() => { vi.clearAllMocks(); table.upsert.mockResolvedValue({ error: null }); table.select.mockReturnValue(table); table.eq.mockReturnValue(table); });
    it('loads the existing profile if another session creates it concurrently', async () => {
        auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'account-a', user_metadata: { full_name: 'New' } } } } });
        table.maybeSingle.mockResolvedValueOnce({ data: null, error: null }).mockResolvedValueOnce({
            data: { id: 'account-a', display_name: 'Existing', household_size: null, savings_goal: null,
                allergies: ['Nuts'], dietary_preferences: [], meal_planning_preferences: [], preferred_stores: [],
                onboarding_complete: true, updated_at: '2026-01-01' }, error: null
        });
        await expect(loadProfile()).resolves.toMatchObject({ displayName: 'Existing', allergies: ['Nuts'] });
        expect(table.upsert).toHaveBeenCalledWith(expect.objectContaining({ id: 'account-a' }), expect.objectContaining({ ignoreDuplicates: true }));
    });
    it('does not treat a session error as a guest session', async () => {
        auth.getSession.mockResolvedValue({ data: { session: null }, error: new Error('session unavailable') });
        await expect(saveProfile(createProfile())).rejects.toThrow('session unavailable');
        expect(local.setItem).not.toHaveBeenCalled();
    });
    it('rejects saving another user’s profile', async () => {
        auth.getSession.mockResolvedValue({ data: { session: { user: { id: 'account-b' } } } });
        const profile = { ...createProfile(), id: 'account-a' };
        await expect(saveProfile(profile)).rejects.toThrow('another account');
        expect(table.upsert).not.toHaveBeenCalled();
    });
    it('does not save an account profile into guest storage after sign-out', async () => {
        auth.getSession.mockResolvedValue({ data: { session: null } });
        await expect(saveProfile({ ...createProfile(), id: 'account-a' })).rejects.toThrow('Sign in again');
        expect(local.setItem).not.toHaveBeenCalled();
    });
});
