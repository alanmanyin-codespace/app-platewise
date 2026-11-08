import { describe, expect, it, vi } from 'vitest';
vi.mock('@react-native-async-storage/async-storage', () => ({ createAsyncStorage: () => ({ getItem: vi.fn(), setItem: vi.fn() }) }));
import { loadRecipeOptions, RECIPE_OPTIONS_KEY, searchIngredients, type IngredientOption } from './recipeOptions';

const bodies: Record<string, unknown> = {
    '/v1/recipes/ingredients': { ingredients: [{ key: 'cheddar cheese', name: 'Cheddar Cheese', recipeCount: 30 }] },
    '/v1/recipes/cuisines': { cuisines: [{ name: 'Italian', recipeCount: 60 }] },
    '/v1/recipes/proteins': { proteins: [{ name: 'Plant-based', categories: ['Vegetarian', 'Vegan'], recipeCount: 107 }] },
    '/v1/stores': { stores: [{ name: 'Walmart', offerCount: 144 }] }
};
const okFetch = vi.fn(async (url: string) => {
    const path = new URL(url).pathname;
    return { ok: true, json: async () => bodies[path] } as Response;
});
const memory = () => { const data = new Map<string, string>(); return { data, getItem: async (k: string) => data.get(k) ?? null, setItem: async (k: string, v: string) => { data.set(k, v); } }; };
const expected = { ingredients: [{ key: 'cheddar cheese', name: 'Cheddar Cheese', recipeCount: 30 }], cuisines: ['Italian'], proteins: [{ name: 'Plant-based', categories: ['Vegetarian', 'Vegan'] }], stores: ['Walmart'] };

describe('recipe options', () => {
    it('loads all four lists for Calgary and caches them', async () => {
        const storage = memory();
        await expect(loadRecipeOptions(okFetch as unknown as typeof fetch, storage, 'https://api.test')).resolves.toEqual({ ...expected, source: 'network' });
        expect(okFetch).toHaveBeenCalledWith('https://api.test/v1/stores?market=calgary');
        expect(JSON.parse(storage.data.get(RECIPE_OPTIONS_KEY)!)).toEqual(expected);
    });

    it('uses the cached copy when any request fails', async () => {
        const storage = memory();
        storage.data.set(RECIPE_OPTIONS_KEY, JSON.stringify(expected));
        const partial = vi.fn(async (url: string) => (url.includes('/stores') ? { ok: false } as Response : okFetch(url)));
        await expect(loadRecipeOptions(partial as unknown as typeof fetch, storage, 'https://api.test')).resolves.toEqual({ ...expected, source: 'cache' });
    });

    it('returns empty lists without throwing when offline with no cache', async () => {
        const offline = vi.fn(async () => { throw new TypeError('Network request failed'); });
        await expect(loadRecipeOptions(offline as unknown as typeof fetch, memory(), 'https://api.test')).resolves.toEqual({ ingredients: [], cuisines: [], proteins: [], stores: [], source: 'none' });
    });

    it('returns empty lists when no API address is configured', async () => {
        await expect(loadRecipeOptions(okFetch as unknown as typeof fetch, memory(), undefined)).resolves.toMatchObject({ source: 'none' });
    });
});

describe('ingredient search', () => {
    const list: IngredientOption[] = [
        { key: 'goat cheese', name: 'Goat Cheese', recipeCount: 3 },
        { key: 'cheddar cheese', name: 'Cheddar Cheese', recipeCount: 30 },
        { key: 'cheese', name: 'Cheese', recipeCount: 12 },
        { key: 'chervil', name: 'Chervil', recipeCount: 1 }
    ];
    it('ranks prefix matches first, then by how many recipes use them', () => {
        expect(searchIngredients(list, 'CHEE').map((item) => item.key)).toEqual(['cheese', 'cheddar cheese', 'goat cheese']);
    });
    it('returns nothing for an empty query and respects the limit', () => {
        expect(searchIngredients(list, '  ')).toEqual([]);
        expect(searchIngredients(list, 'che', 2)).toHaveLength(2);
    });
});
