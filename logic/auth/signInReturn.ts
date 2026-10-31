type ReturnStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
export type SignInDestination = 'profile' | 'interview';
const KEY = 'platewise:profile-after-sign-in';

export function markProfileReturn(storage: ReturnStorage, destination: SignInDestination = 'profile'): void {
    storage.setItem(KEY, destination);
}

export function clearProfileReturn(storage: ReturnStorage): void {
    storage.removeItem(KEY);
}

export function takeSignInReturn(storage: ReturnStorage, signedIn: boolean): SignInDestination | null {
    if (!signedIn) return null;
    const value = storage.getItem(KEY);
    if (value !== 'profile' && value !== 'interview' && value !== '1') return null;
    clearProfileReturn(storage);
    return value === 'interview' ? 'interview' : 'profile';
}

export function takeProfileReturn(storage: ReturnStorage, signedIn: boolean): boolean {
    return takeSignInReturn(storage, signedIn) === 'profile';
}
