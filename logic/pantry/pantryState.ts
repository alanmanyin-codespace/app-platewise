import { atom } from 'jotai';
import { addQuantities, type Quantity } from './units';
import type { PantryItem } from './types';

export const pantryAtom = atom<PantryItem[]>([]);
export const pantryHydratedAtom = atom(false);

/**
 * Adds stock, merging into the existing line for that ingredient so the pantry
 * never shows the same item twice. When the units cannot be combined — adding
 * "2 pieces" to a line held in grams — the new amount replaces the old rather
 * than inventing a conversion; the user's latest entry is the better guess.
 */
export function addPantryItem(pantry: PantryItem[], item: PantryItem): PantryItem[] {
    const existing = pantry.find((entry) => entry.ingredientId === item.ingredientId);
    if (!existing) {
        return [...pantry, item];
    }

    const combined = addQuantities(existing.quantity, item.quantity);
    return pantry.map((entry) =>
        entry.ingredientId === item.ingredientId
            ? { ...entry, quantity: combined ?? item.quantity }
            : entry
    );
}

/** Sets an exact amount. Reaching zero removes the line rather than keeping an empty one. */
export function setPantryQuantity(
    pantry: PantryItem[],
    ingredientId: string,
    quantity: Quantity
): PantryItem[] {
    if (quantity.amount <= 0) {
        return removePantryItem(pantry, ingredientId);
    }
    return pantry.map((entry) =>
        entry.ingredientId === ingredientId ? { ...entry, quantity } : entry
    );
}

export function removePantryItem(pantry: PantryItem[], ingredientId: string): PantryItem[] {
    return pantry.filter((entry) => entry.ingredientId !== ingredientId);
}

/**
 * Reads the pantry back from storage. Anything unreadable yields an empty
 * pantry instead of throwing: a corrupt entry should cost the user their saved
 * inventory, not the ability to open the app.
 */
export function parseStoredPantry(raw: string | null): PantryItem[] {
    if (!raw) {
        return [];
    }

    try {
        const parsed: unknown = JSON.parse(raw);
        if (!Array.isArray(parsed)) {
            return [];
        }
        return parsed.filter(isPantryItem);
    } catch {
        return [];
    }
}

function isPantryItem(value: unknown): value is PantryItem {
    if (typeof value !== 'object' || value === null) {
        return false;
    }
    const entry = value as Partial<PantryItem>;
    return (
        typeof entry.ingredientId === 'string' &&
        entry.ingredientId.length > 0 &&
        typeof entry.name === 'string' && entry.name.trim().length > 0 &&
        (entry.photo === undefined || typeof entry.photo === 'string') &&
        typeof entry.quantity === 'object' &&
        entry.quantity !== null &&
        typeof entry.quantity.amount === 'number' && Number.isFinite(entry.quantity.amount) && entry.quantity.amount > 0 &&
        ['g', 'kg', 'ml', 'l', 'piece'].includes(entry.quantity.unit)
    );
}
