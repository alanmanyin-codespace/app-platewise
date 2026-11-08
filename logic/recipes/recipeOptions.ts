import { createAsyncStorage } from '@react-native-async-storage/async-storage';

/** Interview option lists served by platewise-api from the recipe catalogue and Calgary flyers. */
export type IngredientOption = { key: string; name: string; recipeCount: number };
export type ProteinOption = { name: string; categories: string[] };
export type RecipeOptionLists = { ingredients: IngredientOption[]; cuisines: string[]; proteins: ProteinOption[]; stores: string[] };
export type RecipeOptions = RecipeOptionLists & { source: 'network' | 'cache' | 'none' };
type Storage = { getItem(key: string): Promise<string | null>; setItem(key: string, value: string): Promise<void> };

export const RECIPE_OPTIONS_KEY = 'platewise.recipeOptions.v1';
const MARKET = 'calgary';
const EMPTY: RecipeOptionLists = { ingredients: [], cuisines: [], proteins: [], stores: [] };
const defaultStorage = createAsyncStorage('all-about-savings');

async function getJson(fetchFn: typeof fetch, url: string): Promise<Record<string, unknown>> {
    const response = await fetchFn(url);
    if (!response.ok) throw new Error(`Request failed: ${url}`);
    return (await response.json()) as Record<string, unknown>;
}

function list<T>(body: Record<string, unknown>, field: string): T[] {
    const value = body[field];
    if (!Array.isArray(value)) throw new Error(`Missing ${field}`);
    return value as T[];
}

async function fetchLists(fetchFn: typeof fetch, baseUrl: string): Promise<RecipeOptionLists> {
    const base = baseUrl.replace(/\/+$/, '');
    const [ingredients, cuisines, proteins, stores] = await Promise.all([
        getJson(fetchFn, `${base}/v1/recipes/ingredients`),
        getJson(fetchFn, `${base}/v1/recipes/cuisines`),
        getJson(fetchFn, `${base}/v1/recipes/proteins`),
        getJson(fetchFn, `${base}/v1/stores?market=${MARKET}`)
    ]);
    return {
        ingredients: list<IngredientOption>(ingredients, 'ingredients').map(({ key, name, recipeCount }) => ({ key, name, recipeCount })),
        cuisines: list<{ name: string }>(cuisines, 'cuisines').map(({ name }) => name),
        proteins: list<ProteinOption>(proteins, 'proteins').map(({ name, categories }) => ({ name, categories })),
        stores: list<{ name: string }>(stores, 'stores').map(({ name }) => name)
    };
}

async function readCache(storage: Storage): Promise<RecipeOptionLists | null> {
    try {
        const raw = await storage.getItem(RECIPE_OPTIONS_KEY);
        const value = raw ? (JSON.parse(raw) as RecipeOptionLists) : null;
        return value && Array.isArray(value.ingredients) && Array.isArray(value.cuisines) && Array.isArray(value.proteins) && Array.isArray(value.stores) ? value : null;
    } catch {
        return null;
    }
}

/**
 * All four lists load together; if any request fails the last good copy is used,
 * so the interview never mixes fresh and stale lists. Never throws.
 */
export async function loadRecipeOptions(
    fetchFn: typeof fetch = fetch,
    storage: Storage = defaultStorage,
    baseUrl: string | undefined = process.env.EXPO_PUBLIC_PLATEWISE_API_URL
): Promise<RecipeOptions> {
    if (baseUrl) {
        try {
            const lists = await fetchLists(fetchFn, baseUrl);
            await storage.setItem(RECIPE_OPTIONS_KEY, JSON.stringify(lists)).catch(() => undefined);
            return { ...lists, source: 'network' };
        } catch {
            // Fall through to the cached copy.
        }
    }
    const cached = await readCache(storage);
    return cached ? { ...cached, source: 'cache' } : { ...EMPTY, source: 'none' };
}

/** Case-insensitive name search: names starting with the query first, then the most-used ingredients. */
export function searchIngredients(list: IngredientOption[], query: string, limit = 20): IngredientOption[] {
    const needle = query.trim().toLowerCase();
    if (!needle) return [];
    return list
        .filter((item) => item.name.toLowerCase().includes(needle))
        .sort((a, b) => Number(b.name.toLowerCase().startsWith(needle)) - Number(a.name.toLowerCase().startsWith(needle)) || b.recipeCount - a.recipeCount)
        .slice(0, limit);
}
