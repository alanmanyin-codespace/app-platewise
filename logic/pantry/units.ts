export type MassUnit = 'g' | 'kg';
export type VolumeUnit = 'ml' | 'l';
export type CountUnit = 'piece';
export type Unit = MassUnit | VolumeUnit | CountUnit;

export type UnitFamily = 'mass' | 'volume' | 'count';

export type Quantity = {
    amount: number;
    unit: Unit;
};

/** Each unit expressed in its family's base unit: grams, millilitres, pieces. */
const unitsInBase: Record<Unit, { family: UnitFamily; perBase: number }> = {
    g: { family: 'mass', perBase: 1 },
    kg: { family: 'mass', perBase: 1000 },
    ml: { family: 'volume', perBase: 1 },
    l: { family: 'volume', perBase: 1000 },
    piece: { family: 'count', perBase: 1 }
};

/**
 * Quantities come out of repeated multiply/divide, which leaves artifacts like
 * 1200.0000000000002. Grocery amounts never need more than milligram-scale
 * precision, so round the noise away rather than letting it reach the UI.
 */
function round(amount: number): number {
    return Math.round(amount * 1e6) / 1e6;
}

export function getUnitFamily(unit: Unit): UnitFamily {
    return unitsInBase[unit].family;
}

export function areUnitsCompatible(a: Unit, b: Unit): boolean {
    return getUnitFamily(a) === getUnitFamily(b);
}

/**
 * Returns null across families rather than guessing. Converting grams to
 * millilitres needs the ingredient's density, which we do not hold, and a
 * plausible-looking wrong number is worse here than no answer.
 */
export function convertQuantity(quantity: Quantity, unit: Unit): Quantity | null {
    if (!areUnitsCompatible(quantity.unit, unit)) {
        return null;
    }
    const base = quantity.amount * unitsInBase[quantity.unit].perBase;
    return { amount: round(base / unitsInBase[unit].perBase), unit };
}

export function addQuantities(a: Quantity, b: Quantity): Quantity | null {
    const converted = convertQuantity(b, a.unit);
    if (!converted) {
        return null;
    }
    return { amount: round(a.amount + converted.amount), unit: a.unit };
}

/** Clamped at zero: a requirement more than covered is covered, not negative. */
export function subtractQuantities(a: Quantity, b: Quantity): Quantity | null {
    const converted = convertQuantity(b, a.unit);
    if (!converted) {
        return null;
    }
    return { amount: round(Math.max(0, a.amount - converted.amount)), unit: a.unit };
}
