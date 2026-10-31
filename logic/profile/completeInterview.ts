import { createProfile } from './profileState';
import { saveProfile } from './profileStorage';
import type { Profile, ProfilePatch } from './types';

export async function completeInterviewForUser(patch: ProfilePatch, userId: string, existingProfile?: Profile | null): Promise<Profile> {
    const profile = { ...createProfile(patch), id: userId, ...(existingProfile?.id === userId && patch.displayName === undefined ? { displayName: existingProfile.displayName } : {}) };
    await saveProfile(profile);
    return profile;
}
