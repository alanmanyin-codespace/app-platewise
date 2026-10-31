import { describe, expect, it } from 'vitest';
import { calculateRestock, getMissingLines } from './restock';
import type { PantryItem, RecipeRequirement } from './types';

function requirement(
    ingredientId: string,
    amount: number | null,
    unit: 'g' | 'kg' | 'ml' | 'l' | 'piece',
    recipe: string
): RecipeRequirement {
    return {
        ingredientId,
        name: ingredientId,
        quantity: amount === null ? null : { amount, unit },
        recipe
    };
}

function pantryItem(
    ingredientId: string,
    amount: number,
    unit: 'g' | 'kg' | 'ml' | 'l' | 'piece'
): PantryItem {
    return { ingredientId, name: ingredientId, quantity: { amount, unit } };
}

describe('combining requirements across recipes', () => {
    it('sums the same ingredient needed by two recipes into one line', () => {
        const lines = calculateRestock(
            [requirement('salmon', 600, 'g', 'Salmon Bake'), requirement('salmon', 1, 'kg', 'Chowder')],
            []
        );

        expect(lines).toHaveLength(1);
        expect(lines[0].required).toEqual({ amount: 1600, unit: 'g' });
        expect(lines[0].recipes).toEqual(['Salmon Bake', 'Chowder']);
    });

    it('keeps different ingredients on separate lines', () => {
        const lines = calculateRestock(
            [requirement('salmon', 600, 'g', 'Salmon Bake'), requirement('asparagus', 1, 'piece', 'Salmon Bake')],
            []
        );

        expect(lines.map((line) => line.ingredientId)).toEqual(['salmon', 'asparagus']);
    });
});

describe('subtracting pantry stock', () => {
    it('reports nothing missing when the pantry covers the requirement', () => {
        const lines = calculateRestock([requirement('salmon', 600, 'g', 'Salmon Bake')], [pantryItem('salmon', 1, 'kg')]);

        expect(lines[0].covered).toBe(true);
        expect(lines[0].missing).toEqual({ amount: 0, unit: 'g' });
    });

    it('reports only the shortfall when the pantry partly covers it', () => {
        const lines = calculateRestock([requirement('salmon', 600, 'g', 'Salmon Bake')], [pantryItem('salmon', 250, 'g')]);

        expect(lines[0].covered).toBe(false);
        expect(lines[0].missing).toEqual({ amount: 350, unit: 'g' });
    });

    it('ignores pantry items no planned recipe asks for', () => {
        const lines = calculateRestock([requirement('salmon', 600, 'g', 'Salmon Bake')], [pantryItem('rice', 2, 'kg')]);

        expect(lines).toHaveLength(1);
        expect(lines[0].ingredientId).toBe('salmon');
    });
});

describe('quantities the data cannot answer', () => {
    it('treats an unknown required amount as still needed rather than covered', () => {
        const lines = calculateRestock([requirement('asparagus', null, 'g', 'Salmon Bake')], [pantryItem('asparagus', 500, 'g')]);

        expect(lines[0].covered).toBe(false);
        expect(lines[0].missing).toBeNull();
    });

    it('does not subtract pantry stock measured in an incompatible unit', () => {
        const lines = calculateRestock([requirement('syrup', 250, 'ml', 'Salmon Bake')], [pantryItem('syrup', 300, 'g')]);

        expect(lines[0].covered).toBe(false);
        expect(lines[0].missing).toEqual({ amount: 250, unit: 'ml' });
    });
});

describe('the resulting shopping list', () => {
    it('leaves out ingredients the pantry already covers', () => {
        const lines = calculateRestock(
            [requirement('salmon', 600, 'g', 'Salmon Bake'), requirement('rice', 200, 'g', 'Salmon Bake')],
            [pantryItem('salmon', 1, 'kg')]
        );

        expect(getMissingLines(lines).map((line) => line.ingredientId)).toEqual(['rice']);
    });
});

describe('purity', () => {
    it('does not consume pantry stock, because planning is not cooking', () => {
        const pantry = [pantryItem('salmon', 1, 'kg')];
        calculateRestock([requirement('salmon', 600, 'g', 'Salmon Bake')], pantry);

        expect(pantry[0].quantity).toEqual({ amount: 1, unit: 'kg' });
    });
});
