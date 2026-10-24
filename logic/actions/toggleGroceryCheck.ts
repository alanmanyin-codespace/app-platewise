import { groceryItemsListAtom } from '@/logic/app-state/groceryItemsListAtom';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

type Params = {
    itemId?: string;
};

export function toggleGroceryCheck({ itemId }: Params) {
    store.set(
        groceryItemsListAtom,
        store.get(groceryItemsListAtom).map((item) =>
            item.id === itemId ? { ...item, completed: !item.completed } : item
        )
    );
}
