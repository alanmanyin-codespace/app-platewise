import { addQuantities, subtractQuantities, type Quantity } from './units';
import type { PantryItem, RecipeRequirement, RestockLine } from './types';

/**
 * Works out what still has to be bought for a set of planned recipes.
 *
 * Pure: it reads the pantry but never changes it. Planning a meal is not
 * cooking it, so stock is only consumed on a confirmed purchase or a cook.
 *
 * Where the data cannot answer a question — an unknown required amount, or
 * pantry stock held in a unit that cannot convert to the requirement's — the
 * line stays uncovered. Over-buying is recoverable; arriving home without an
 * ingredient is not.
 */
export function calculateRestock(
    requirements: RecipeRequirement[],
    pantry: PantryItem[]
): RestockLine[] {
    const combined = new Map<string, RestockLine>();

    for (const requirement of requirements) {
        const existing = combined.get(requirement.ingredientId);

        if (!existing) {
            combined.set(requirement.ingredientId, {
                ingredientId: requirement.ingredientId,
                name: requirement.name,
                required: requirement.quantity,
                inPantry: null,
                missing: null,
                recipes: [requirement.recipe],
                covered: false
            });
            continue;
        }

        if (!existing.recipes.includes(requirement.recipe)) {
            existing.recipes.push(requirement.recipe);
        }
        existing.required = sumRequired(existing.required, requirement.quantity);
    }

    for (const line of combined.values()) {
        const stock = pantry.find((item) => item.ingredientId === line.ingredientId);
        line.inPantry = stock ? stock.quantity : null;

        if (!line.required) {
            // Unknown requirement: nothing to subtract from, so nothing is proven covered.
            line.missing = null;
            line.covered = false;
            continue;
        }

        if (!stock) {
            line.missing = line.required;
            line.covered = false;
            continue;
        }

        const remaining = subtractQuantities(line.required, stock.quantity);
        // A null here means the units do not convert, so the stock cannot be
        // counted against the requirement. Keep the full amount on the list.
        line.missing = remaining ?? line.required;
        line.covered = remaining !== null && remaining.amount === 0;
    }

    return [...combined.values()];
}

/** The shopping list: every line the pantry does not already cover. */
export function getMissingLines(lines: RestockLine[]): RestockLine[] {
    return lines.filter((line) => !line.covered);
}

/**
 * Two amounts of the same ingredient. An unknown on either side makes the total
 * unknown — a partial sum would read as the whole requirement and under-buy.
 */
function sumRequired(a: Quantity | null, b: Quantity | null): Quantity | null {
    if (!a || !b) {
        return null;
    }
    return addQuantities(a, b);
}
