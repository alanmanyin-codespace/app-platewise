import { describe, expect, it } from 'vitest';
import { normalizeIngredientId, parseQuantityFromName } from './normalizeIngredient';

describe('normalizing an ingredient name into an id', () => {
    it('lowercases and hyphenates so the same item matches across recipes', () => {
        expect(normalizeIngredientId('Fresh Green Asparagus Bunch')).toBe(
            'fresh-green-asparagus-bunch'
        );
    });

    it('drops the packaging size so a 600g and a 1kg listing share an id', () => {
        expect(normalizeIngredientId('Atlantic Salmon Fillets (600g)')).toBe(
            'atlantic-salmon-fillets'
        );
        expect(normalizeIngredientId('Atlantic Salmon Fillets (1kg)')).toBe(
            'atlantic-salmon-fillets'
        );
    });

    it('ignores punctuation and repeated whitespace', () => {
        expect(normalizeIngredientId('  Dijon Mustard &  Fresh Garlic ')).toBe(
            'dijon-mustard-fresh-garlic'
        );
    });

    it('returns an empty id for a blank name rather than throwing', () => {
        expect(normalizeIngredientId('   ')).toBe('');
    });
});

describe('reading a quantity out of an ingredient name', () => {
    it('reads a parenthesised mass', () => {
        expect(parseQuantityFromName('Atlantic Salmon Fillets (600g)')).toEqual({
            amount: 600,
            unit: 'g'
        });
    });

    it('reads a decimal mass in kilograms', () => {
        expect(parseQuantityFromName('Lean Ground Beef (1.2kg)')).toEqual({
            amount: 1.2,
            unit: 'kg'
        });
    });

    it('reads a volume in millilitres', () => {
        expect(parseQuantityFromName('Pure Canadian Maple Syrup (250ml)')).toEqual({
            amount: 250,
            unit: 'ml'
        });
    });

    it('reads a pack count as pieces', () => {
        expect(parseQuantityFromName('Flour Tortillas 10-pack')).toEqual({
            amount: 10,
            unit: 'piece'
        });
    });

    it('returns null when the name carries no quantity', () => {
        expect(parseQuantityFromName('Fresh Green Asparagus Bunch')).toBeNull();
    });
});
