import { atom, getDefaultStore } from 'jotai';
import { groceryItemsListAtom } from '@/logic/app-state/groceryItemsListAtom';
import { pantryAtom } from './pantryState';
import { buildPantryShoppingList } from './shoppingList';
import type { Recipe } from '@/logic/types';

export const shoppingRecipesAtom = atom<Recipe[]>([]);

export function syncShoppingList() {
    const store = getDefaultStore();
    const existing = store.get(groceryItemsListAtom);
    const generated = buildPantryShoppingList(store.get(shoppingRecipesAtom), store.get(pantryAtom));
    store.set(groceryItemsListAtom, [
        ...existing.filter((item) => !item.id.startsWith('pantry-')),
        ...generated.map((item) => ({ ...item, completed: existing.find((old) => old.id === item.id)?.completed ?? false }))
    ]);
}
