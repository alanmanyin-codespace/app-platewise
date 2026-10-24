import { find } from '@/lib/array/find';
import { filter } from '@/lib/array/filter';
import { compare } from '@/lib/boolean/compare';
import { allergyFiltersAtom } from '@/logic/app-state/allergyFiltersAtom';
import { getDefaultStore } from 'jotai';

const store = getDefaultStore();

type Params = {
    allergen?: string;
};

export function toggleAllergy({ allergen }: Params) {
    if (find(store.get(allergyFiltersAtom), (item) => compare(item, allergen, 'equals'))) {
        store.set(
            allergyFiltersAtom,
            filter(store.get(allergyFiltersAtom), (item) => compare(item, allergen, 'notEquals'))
        );
    } else {
        store.set(allergyFiltersAtom, [...store.get(allergyFiltersAtom), allergen]);
    }
}
