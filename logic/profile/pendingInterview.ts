import type { ProfilePatch } from './types';

type DraftStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const KEY = 'platewise:pending-profile-interview';
let memoryDraft: string | null = null;

function browserStorage(): DraftStorage | undefined {
    return typeof window !== 'undefined' && typeof window.sessionStorage !== 'undefined' ? window.sessionStorage : undefined;
}

/** Temporary per-tab draft; native keeps it only while the app remains open. */
export function savePendingInterview(patch: ProfilePatch, storage = browserStorage()): void {
    const value = JSON.stringify(patch);
    if (storage) storage.setItem(KEY, value);
    memoryDraft = value;
}

export function getPendingInterview(storage = browserStorage()): ProfilePatch | null {
    try {
        const raw = storage ? storage.getItem(KEY) : memoryDraft;
        if (!raw) return null;
        const value: unknown = JSON.parse(raw);
        if (!value || typeof value !== 'object' || Array.isArray(value) || (value as ProfilePatch).onboardingComplete !== true) return null;
        return value as ProfilePatch;
    } catch { return null; }
}

export function clearPendingInterview(storage = browserStorage()): void {
    if (storage) storage.removeItem(KEY);
    memoryDraft = null;
}
