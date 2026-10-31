import { createProfile } from './profileState';
import type { Profile } from './types';

/** Start an account profile without copying another local user's preferences. */
export function profileFromAccount(account: { id: string; displayName?: string }, now = new Date().toISOString()): Profile {
    return { ...createProfile({ displayName: account.displayName }, now), id: account.id };
}

export function accountOwnsProfile(profile: Profile, userId: string): boolean {
    return profile.id === userId;
}
