import { atom } from 'jotai';
import type { GroceryItem } from '@/logic/types';

export const groceryItemsListAtom = atom<GroceryItem[]>([]);
