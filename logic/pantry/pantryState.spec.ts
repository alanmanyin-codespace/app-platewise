import { describe, expect, it } from 'vitest';
import { addPantryItem, parseStoredPantry, removePantryItem, setPantryQuantity } from './pantryState';
import type { PantryItem } from './types';

const salmon: PantryItem = {
    ingredientId: 'salmon',
    name: 'Atlantic Salmon Fillets',
    quantity: { amount: 600, unit: 'g' }
};

describe('adding to the pantry', () => {
    it('appends an ingredient the pantry does not hold yet', () => {
        expect(addPantryItem([], salmon)).toEqual([salmon]);
    });

    it('adds to the existing amount instead of creating a duplicate line', () => {
        const result = addPantryItem([salmon], {
            ...salmon,
            quantity: { amount: 1, unit: 'kg' }
        });

        expect(result).toHaveLength(1);
        expect(result[0].quantity).toEqual({ amount: 1600, unit: 'g' });
    });

    it('replaces the amount when the units cannot be combined', () => {
        const result = addPantryItem([salmon], {
            ...salmon,
            quantity: { amount: 2, unit: 'piece' }
        });

        expect(result).toHaveLength(1);
        expect(result[0].quantity).toEqual({ amount: 2, unit: 'piece' });
    });

    it('leaves the original list untouched', () => {
        const pantry = [salmon];
        addPantryItem(pantry, { ...salmon, quantity: { amount: 1, unit: 'kg' } });

        expect(pantry[0].quantity).toEqual({ amount: 600, unit: 'g' });
    });
});

describe('changing a quantity', () => {
    it('sets an exact amount', () => {
        const result = setPantryQuantity([salmon], 'salmon', { amount: 250, unit: 'g' });

        expect(result[0].quantity).toEqual({ amount: 250, unit: 'g' });
    });

    it('drops the item when the amount reaches zero', () => {
        expect(setPantryQuantity([salmon], 'salmon', { amount: 0, unit: 'g' })).toEqual([]);
    });
});

describe('removing from the pantry', () => {
    it('removes only the named ingredient', () => {
        const rice: PantryItem = {
            ingredientId: 'rice',
            name: 'Rice',
            quantity: { amount: 2, unit: 'kg' }
        };

        expect(removePantryItem([salmon, rice], 'salmon')).toEqual([rice]);
    });
});

describe('reading stored pantry data', () => {
    it('restores a previously saved pantry', () => {
        expect(parseStoredPantry(JSON.stringify([salmon]))).toEqual([salmon]);
    });

    it('keeps a saved photo and rejects an invalid photo value', () => {
        const photographed = { ...salmon, photo: 'data:image/jpeg;base64,YWJj' };
        expect(parseStoredPantry(JSON.stringify([photographed]))).toEqual([photographed]);
        expect(parseStoredPantry(JSON.stringify([{ ...salmon, photo: 123 }]))).toEqual([]);
    });

    it('returns an empty pantry for missing or corrupt storage', () => {
        expect(parseStoredPantry(null)).toEqual([]);
        expect(parseStoredPantry('not json')).toEqual([]);
        expect(parseStoredPantry('{"not":"an array"}')).toEqual([]);
    });

    it('rejects invalid quantities and missing names', () => {
        expect(parseStoredPantry(JSON.stringify([{ ...salmon, quantity: { amount: 1, unit: 'cup' } }, { ...salmon, name: undefined }, { ...salmon, quantity: { amount: -1, unit: 'g' } }]))).toEqual([]);
    });

    it('drops entries that are missing an id or a quantity', () => {
        const stored = JSON.stringify([salmon, { ingredientId: 'rice' }, { quantity: { amount: 1, unit: 'kg' } }]);

        expect(parseStoredPantry(stored)).toEqual([salmon]);
    });
});
