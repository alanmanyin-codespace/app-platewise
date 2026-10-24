import { join } from '@/lib/array/join';
import { groceryItemsListAtom } from '@/logic/app-state/groceryItemsListAtom';
import { getDefaultStore } from 'jotai';
import { Alert } from 'react-native';
import type { Recipe } from '@/logic/types';

const store = getDefaultStore();

type Params = {
    recipe?: Recipe;
};

export function addRecipeIngredientsToGroceries({ recipe }: Params) {
    if (!recipe) {
        return;
    }

    const existingItems = store.get(groceryItemsListAtom);
    store.set(
        groceryItemsListAtom,
        [
            ...existingItems,
            ...recipe.ingredients.map((item, index) => ({
                id: `${recipe.id}-${existingItems.length + index}`,
                name: item.name,
                flyerPrice: item.flyerPrice,
                regPrice: item.regPrice,
                store: item.store,
                completed: false,
                recipe: recipe.title
            }))
        ]
    );
    Alert.alert(
        'Added to Shopping List',
        join([recipe.title, 'ingredients added to your grocery list with current flyer prices.'], {
            type: 'separator',
            separator: ' '
        })
    );
}
