import type { Quantity, Unit } from './units';

/** Size suffixes like "(600g)" or "10-pack" describe the packaging, not the item. */
const sizeInParentheses = /\([^)]*\)/g;
const packSuffix = /\b\d+(\.\d+)?\s*-?\s*pack\b/gi;

const unitAliases: Record<string, Unit> = {
    g: 'g',
    gram: 'g',
    grams: 'g',
    kg: 'kg',
    kilo: 'kg',
    kilos: 'kg',
    kilogram: 'kg',
    kilograms: 'kg',
    ml: 'ml',
    millilitre: 'ml',
    millilitres: 'ml',
    milliliter: 'ml',
    milliliters: 'ml',
    l: 'l',
    litre: 'l',
    litres: 'l',
    liter: 'l',
    liters: 'l'
};

/**
 * Collapses a display name to a stable id so the same ingredient matches across
 * recipes and the pantry. Packaging size is stripped first: "Salmon (600g)" and
 * "Salmon (1kg)" are the same ingredient bought in different amounts, and the
 * amount belongs in a Quantity, not in the identity.
 */
export function normalizeIngredientId(name: string): string {
    return name
        .replace(sizeInParentheses, ' ')
        .replace(packSuffix, ' ')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, ' ')
        .trim()
        .replace(/\s+/g, '-');
}

/**
 * Best-effort reading of the amount baked into a display name, so existing
 * recipe data can be used before it carries structured quantities. Returns null
 * when the name says nothing about amount — the caller must treat that as
 * unknown rather than as zero.
 */
export function parseQuantityFromName(name: string): Quantity | null {
    const pack = name.match(/\b(\d+(?:\.\d+)?)\s*-?\s*pack\b/i);
    if (pack) {
        return { amount: Number(pack[1]), unit: 'piece' };
    }

    const measured = name.match(/\b(\d+(?:\.\d+)?)\s*([a-zA-Z]+)\b/);
    if (!measured) {
        return null;
    }

    const unit = unitAliases[measured[2].toLowerCase()];
    if (!unit) {
        return null;
    }

    return { amount: Number(measured[1]), unit };
}
