type ReturnStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;
const KEY = 'platewise:profile-after-sign-in';

export function markProfileReturn(storage: ReturnStorage): void {
    storage.setItem(KEY, '1');
}

export function clearProfileReturn(storage: ReturnStorage): void {
    storage.removeItem(KEY);
}

export function takeProfileReturn(storage: ReturnStorage, signedIn: boolean): boolean {
    if (!signedIn || storage.getItem(KEY) !== '1') return false;
    clearProfileReturn(storage);
    return true;
}
