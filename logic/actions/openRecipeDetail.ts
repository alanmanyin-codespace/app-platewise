import { selectedRecipeAtom } from '@/logic/app-state/selectedRecipeAtom';
import { router } from 'expo-router';
import { getDefaultStore } from 'jotai';
import type { Recipe } from '@/logic/types';

const store = getDefaultStore();

type Params = {
    recipeData?: Recipe;
};

export function openRecipeDetail({ recipeData }: Params) {
    if (!recipeData) {
        return;
    }
    store.set(selectedRecipeAtom, recipeData);
    router.push({ pathname: '/recipe-detail' });
}
