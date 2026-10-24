import { atom } from 'jotai';
import type { GroceryItem } from '@/logic/types';

export const groceryItemsListAtom = atom<GroceryItem[]>([
    {
        id: 'g1',
        name: 'Atlantic Salmon Fillets (Metro)',
        flyerPrice: 9.99,
        regPrice: 16.99,
        store: 'Metro',
        completed: false,
        recipe: 'Maple-Glazed Salmon'
    },
    {
        id: 'g2',
        name: 'Fresh Asparagus Bunch (Metro)',
        flyerPrice: 2.49,
        regPrice: 4.99,
        store: 'Metro',
        completed: false,
        recipe: 'Maple-Glazed Salmon'
    },
    {
        id: 'g3',
        name: 'Boneless Chicken Breasts (No Frills)',
        flyerPrice: 11,
        regPrice: 18.5,
        store: 'No Frills',
        completed: true,
        recipe: 'Fajita Rice Bowl'
    },
    {
        id: 'g4',
        name: 'Sweet Bell Peppers 3-pack (No Frills)',
        flyerPrice: 2.99,
        regPrice: 5.49,
        store: 'No Frills',
        completed: false,
        recipe: 'Fajita Rice Bowl'
    },
    {
        id: 'g5',
        name: 'Diced Tomatoes Can (Walmart)',
        flyerPrice: 1.25,
        regPrice: 2.19,
        store: 'Walmart',
        completed: false,
        recipe: 'Hearty Beef Chili'
    }
]);
