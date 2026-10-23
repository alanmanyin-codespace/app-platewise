import type { PrimitiveAtom } from 'jotai';

import { useCallback } from 'react';
import { useStore } from 'jotai';
import { isFunction } from 'lodash';

export function useSetAtom<T>(atomInstance: PrimitiveAtom<T>) {
    const store = useStore();

    return useCallback(
        (newValue: T | ((prevValue: T) => T)) => {
            if (isFunction(newValue)) {
                newValue = newValue(store.get(atomInstance));
            }
            store.set(atomInstance, newValue);
        },
        [store, atomInstance]
    );
}
