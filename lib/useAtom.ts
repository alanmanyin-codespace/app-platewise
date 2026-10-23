import type { PrimitiveAtom } from 'jotai';

import { useAtomValue } from './useAtomValue';
import { useSetAtom } from './useSetAtom';

export function useAtom<T>(atomInstance: PrimitiveAtom<T>) {
    return [useAtomValue(atomInstance), useSetAtom(atomInstance)] as const;
}
