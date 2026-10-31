import { beforeEach, describe, expect, it, vi } from 'vitest';
const { signInWithPassword, signUp } = vi.hoisted(() => ({ signInWithPassword: vi.fn(), signUp: vi.fn() }));
vi.mock('./supabase', () => ({ supabase: { auth: { signInWithPassword, signUp } } }));
import { signInWithEmail, signUpWithEmail } from './emailSignIn';

describe('email sign-in', () => {
    beforeEach(() => { vi.resetAllMocks(); });
    it('signs in with the trimmed email and unmodified password', async () => {
        signInWithPassword.mockResolvedValue({ data: { session: { user: { id: 'user-1' } } }, error: null });
        await signInWithEmail('  person@example.com  ', ' secret ');
        expect(signInWithPassword).toHaveBeenCalledWith({ email: 'person@example.com', password: ' secret ' });
    });
    it('does not accept a response without a session', async () => {
        signInWithPassword.mockResolvedValue({ data: { session: null }, error: null });
        await expect(signInWithEmail('person@example.com', 'password')).rejects.toThrow();
    });
    it('propagates authentication errors', async () => {
        signInWithPassword.mockResolvedValue({ data: { session: null }, error: new Error('invalid') });
        await expect(signInWithEmail('person@example.com', 'wrong')).rejects.toThrow('invalid');
    });
});

describe('email sign-up', () => {
    beforeEach(() => { vi.resetAllMocks(); });
    it('creates an account and returns its session user', async () => {
        signUp.mockResolvedValue({ data: { session: { user: { id: 'new-user' } } }, error: null });
        await expect(signUpWithEmail('  person@example.com ', ' secret ', 'https://example.com')).resolves.toBe('new-user');
        expect(signUp).toHaveBeenCalledWith({ email: 'person@example.com', password: ' secret ', options: { emailRedirectTo: 'https://example.com' } });
    });
    it('handles accounts awaiting email confirmation', async () => {
        signUp.mockResolvedValue({ data: { session: null }, error: null });
        await expect(signUpWithEmail('person@example.com', 'password', 'https://example.com')).resolves.toBeNull();
    });
});
