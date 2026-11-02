import { useEffect, useState } from 'react';
import { isAuthSessionMissingError } from '@supabase/supabase-js';
import { useAtom } from '@/lib/useAtom';
import { authReadyAtom, authSessionAtom } from './authState';
import { classifyProfileAccess, isInvalidAuthResponse } from './profileAccess';
import { supabase } from './supabase';

type Verification = { token: string; verifiedUserId?: string | null; invalid?: boolean; unavailable?: boolean };

export function useProfileAccess() {
    const [ready] = useAtom(authReadyAtom);
    const [session] = useAtom(authSessionAtom);
    const [verification, setVerification] = useState<Verification | null>(null);
    const [attempt, setAttempt] = useState(0);
    const token = session?.access_token;
    useEffect(() => {
        if (!ready || !token || !supabase) return;
        let active = true;
        const client = supabase;
        client.auth.getUser().then(({ data, error }) => {
            if (!active) return;
            if (error) {
                const invalid = isAuthSessionMissingError(error) || isInvalidAuthResponse(error);
                setVerification({ token, invalid, unavailable: !invalid });
                if (invalid) void client.auth.signOut({ scope: 'local' }).catch(() => {});
            } else {
                const verifiedUserId = data.user?.id ?? null;
                setVerification({ token, verifiedUserId });
                if (!verifiedUserId || verifiedUserId !== session?.user.id) {
                    void client.auth.signOut({ scope: 'local' }).catch(() => {});
                }
            }
        }).catch(() => { if (active) setVerification({ token, unavailable: true }); });
        return () => { active = false; };
    }, [ready, token, session?.user.id, attempt]);
    const result = verification?.token === token ? verification : null;
    return {
        access: classifyProfileAccess({ ready, sessionUserId: session?.user.id ?? null, ...result }),
        retry: () => setAttempt((value) => value + 1)
    };
}
