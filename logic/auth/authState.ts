import { atom } from 'jotai';
import type { Session } from '@supabase/supabase-js';

export const authSessionAtom = atom<Session | null>(null);
export const authReadyAtom = atom(false);
export const authErrorAtom = atom<string | null>(null);
