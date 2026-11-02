export type ProfileAccess = 'loading' | 'denied' | 'allowed' | 'unavailable';

type Input = {
    ready: boolean;
    sessionUserId: string | null;
    verifiedUserId?: string | null;
    invalid?: boolean;
    unavailable?: boolean;
};

export function classifyProfileAccess(input: Input): ProfileAccess {
    if (!input.ready) return 'loading';
    if (!input.sessionUserId || input.invalid) return 'denied';
    if (input.unavailable) return 'unavailable';
    if (input.verifiedUserId === undefined) return 'loading';
    return input.verifiedUserId === input.sessionUserId ? 'allowed' : 'denied';
}

export function isInvalidAuthResponse(error: { status?: number; code?: string }): boolean {
    return error.status === 401 || error.status === 403 ||
        ['user_not_found', 'session_not_found', 'bad_jwt', 'refresh_token_not_found', 'refresh_token_already_used'].includes(error.code ?? '');
}
