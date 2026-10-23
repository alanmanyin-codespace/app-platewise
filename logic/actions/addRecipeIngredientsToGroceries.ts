import { join } from '@/lib/array/join';
import { groceryItemsListAtom } from '@/logic/app-state/groceryItemsListAtom';
import { getDefaultStore } from 'jotai';
import { Alert } from 'react-native';

const store = getDefaultStore();

type Params = {
    recipe?: object;
};

export function addRecipeIngredientsToGroceries({ recipe }: Params) {
    store.set(
        groceryItemsListAtom,
        undefined([
            store.get(groceryItemsListAtom),
            undefined(recipe.ingredients, (item, index) => ({
                id: undefined(`${store.get(groceryItemsListAtom).length} + ${index} + 1`),
                name: item?.name,
                flyerPrice: item?.flyerPrice,
                regPrice: item?.regPrice,
                store: item?.store,
                completed: false,
                recipe: recipe.title
            }))
        ])
    );
    Alert.alert(
        'Added to Shopping List',
        join([recipe.title, 'ingredients added to your grocery list with current flyer prices.'], {
            type: 'separator',
            separator: ' '
        })
    );
}
