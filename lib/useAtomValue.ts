import type { Atom } from 'jotai';

import { useMemo, useSyncExternalStore } from 'react';
import { useStore } from 'jotai';

export function useAtomValue<T>(atomInstance: Atom<T | Promise<T>>) {
    const store = useStore();

    const [subscribe, getSnapshot] = useMemo(() => {
        let lastAtomValue: T | Promise<T> | undefined;
        let lastResolvedValue: T | undefined;
        let lastOnStoreChange = () => {};

        try {
            const initialValue = store.get(atomInstance);
            lastResolvedValue = initialValue instanceof Promise ? undefined : initialValue;
        } catch {}

        return [
            (onStoreChange) => {
                lastOnStoreChange = onStoreChange;
                return store.sub(atomInstance, onStoreChange);
            },
            (): T | undefined => {
                try {
                    const value = store.get(atomInstance);

                    if (!(value instanceof Promise)) {
                        lastResolvedValue = value;
                    } else if (value !== lastAtomValue) {
                        value
                            .then((resolvedValue) => {
                                lastResolvedValue = resolvedValue;
                                lastOnStoreChange();
                            })
                            .catch();
                    }

                    lastAtomValue = value;
                    return lastResolvedValue;
                } catch {
                    return undefined;
                }
            }
        ] as Parameters<typeof useSyncExternalStore<T>>;
    }, [atomInstance]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}
