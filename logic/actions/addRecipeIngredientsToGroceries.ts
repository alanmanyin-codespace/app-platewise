import { getDefaultStore } from 'jotai';
import { Alert } from 'react-native';
import { pantryHydratedAtom } from '@/logic/pantry/pantryState';
import { shoppingRecipesAtom, syncShoppingList } from '@/logic/pantry/syncShoppingList';
import type { Recipe } from '@/logic/types';

export function addRecipeIngredientsToGroceries({ recipe }: { recipe?: Recipe }) {
    if (!recipe) return;
    const store = getDefaultStore();
    if (!store.get(pantryHydratedAtom)) {
        Alert.alert('Pantry is loading', 'Please try again in a moment.');
        return;
    }
    const recipes = store.get(shoppingRecipesAtom);
    store.set(shoppingRecipesAtom, [...recipes.filter((item) => item.id !== recipe.id), recipe]);
    syncShoppingList();
    Alert.alert('Shopping list updated', 'Missing ingredients have been added to your shopping list.');
}
