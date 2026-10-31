import { describe, expect, it } from 'vitest';
import { addQuantities, areUnitsCompatible, convertQuantity, subtractQuantities } from './units';

describe('unit compatibility', () => {
    it('treats units in the same family as compatible', () => {
        expect(areUnitsCompatible('g', 'kg')).toBe(true);
        expect(areUnitsCompatible('ml', 'l')).toBe(true);
    });

    it('treats units from different families as incompatible', () => {
        expect(areUnitsCompatible('g', 'ml')).toBe(false);
        expect(areUnitsCompatible('piece', 'g')).toBe(false);
    });
});

describe('quantity conversion', () => {
    it('converts up and down within the mass family', () => {
        expect(convertQuantity({ amount: 1.2, unit: 'kg' }, 'g')).toEqual({ amount: 1200, unit: 'g' });
        expect(convertQuantity({ amount: 600, unit: 'g' }, 'kg')).toEqual({ amount: 0.6, unit: 'kg' });
    });

    it('converts up and down within the volume family', () => {
        expect(convertQuantity({ amount: 0.25, unit: 'l' }, 'ml')).toEqual({ amount: 250, unit: 'ml' });
    });

    it('refuses to convert across families rather than guessing a density', () => {
        expect(convertQuantity({ amount: 100, unit: 'g' }, 'ml')).toBeNull();
        expect(convertQuantity({ amount: 2, unit: 'piece' }, 'g')).toBeNull();
    });
});

describe('adding quantities', () => {
    it('sums two quantities in the left-hand unit', () => {
        expect(addQuantities({ amount: 600, unit: 'g' }, { amount: 1, unit: 'kg' })).toEqual({
            amount: 1600,
            unit: 'g'
        });
    });

    it('returns null for incompatible units instead of a wrong number', () => {
        expect(addQuantities({ amount: 1, unit: 'piece' }, { amount: 100, unit: 'g' })).toBeNull();
    });
});

describe('subtracting quantities', () => {
    it('subtracts in the left-hand unit', () => {
        expect(subtractQuantities({ amount: 1, unit: 'kg' }, { amount: 250, unit: 'g' })).toEqual({
            amount: 0.75,
            unit: 'kg'
        });
    });

    it('clamps at zero so covered requirements never go negative', () => {
        expect(subtractQuantities({ amount: 200, unit: 'g' }, { amount: 1, unit: 'kg' })).toEqual({
            amount: 0,
            unit: 'g'
        });
    });

    it('returns null for incompatible units', () => {
        expect(subtractQuantities({ amount: 1, unit: 'l' }, { amount: 1, unit: 'piece' })).toBeNull();
    });
});
