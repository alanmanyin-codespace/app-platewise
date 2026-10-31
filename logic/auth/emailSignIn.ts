import { supabase } from './supabase';

export async function signInWithEmail(email: string, password: string): Promise<string> {
    if (!supabase) throw new Error('Authentication is not configured.');
    const { data, error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    if (error) throw error;
    if (!data.session) throw new Error('No session was returned.');
    return data.session.user.id;
}

export async function signUpWithEmail(email: string, password: string, emailRedirectTo: string): Promise<string | null> {
    if (!supabase) throw new Error('Authentication is not configured.');
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { emailRedirectTo } });
    if (error) throw error;
    return data.session?.user.id ?? null;
}
