import { selectedRecipeAtom } from '@/logic/app-state/selectedRecipeAtom';
import { router } from 'expo-router';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

type Params = {
    recipeData?: object;
};

export function openRecipeDetail({ recipeData }: Params) {
    store.set(selectedRecipeAtom, recipeData);
    router.push({ pathname: '/recipe-detail' });
}
