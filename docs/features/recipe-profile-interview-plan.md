# Recipe-linked Profile Interview Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reshape the profile wizard around the recipe data (cuisines, proteins, disliked ingredients, Calgary stores), fed by two new public platewise-api endpoints (ingredients, cuisines, proteins, stores), plus a tested recipe-matching module that applies the answers.

**Architecture:** platewise-api (Cloudflare Worker + D1) gains `GET /v1/recipes/ingredients`, `/v1/recipes/cuisines`, `/v1/recipes/proteins` and `/v1/stores?market=`, read from `recipes`, `recipe_ingredients`, `offers` and a new curated `retailers` table. The Expo app fetches those lists (cached in AsyncStorage), shows them in the wizard, stores three new profile arrays locally and in Supabase, and exposes `matchRecipes()` in shared logic. Wiring the 793 recipes into the recipe screens is out of scope (design: Non-goals).

**Tech Stack:** platewise-api: TypeScript, Wrangler 4, D1, `node --test`. app-plate-wise: Expo / React Native, jotai, Supabase, vitest.

**Spec:** `docs/features/recipe-profile-interview.md`

## Global Constraints

- Calgary only. Store options: No preference + `GET /v1/stores?market=calgary` (grocery retailers in `retailers` with ≥1 current offer).
- Wizard order: name, household, cuisines, proteins, disliked ingredients, allergies, diet, stores.
- Groups: `about` "About you" (name, household); `food` "What you eat" (cuisines, proteins, disliked, allergies, diet); `shopping` "Where you shop" (stores).
- Proteins: No preference + `GET /v1/recipes/proteins` (Beef, Chicken, Goat, Lamb, Pork, Seafood; Vegetarian+Vegan → "Plant-based").
- Allergies: None, Peanuts, Tree Nuts, Dairy, Gluten, Shellfish, Fish, Eggs, Soy, Sesame (keep the existing stored spelling "Tree Nuts").
- Diet: No preference, Vegetarian, Vegan, Pescatarian, No pork, No beef.
- "None" and "No preference" stay exclusive of other options.
- Savings goal and meal planning: removed from wizard, completion and summary; stored values and DB columns untouched.
- Profile stores ingredient **keys** (platewise-api `ingredientKey` output) and cuisine area names, not display text.
- New API endpoints are public GET, `Cache-Control: public, max-age=86400`, and send `Access-Control-Allow-Origin: *` (the web build on Vercel calls them cross-origin).
- Commits carry no AI attribution lines.
- No deploy, remote migration, or Supabase migration push without the user's explicit go-ahead.

## Review Focus

- A store dropping out of `/v1/stores` (no current offers this week) stays in the user's saved stores and is shown as selected when editing — test in Task 4.
- A stored profile from before this change (no `cuisines`/`proteins`/`dislikedIngredients`) must still load, not reset to null — test in Task 3.
- Old profiles holding hidden diet values ("High protein", "Low carb") or old stores ("Metro") must not crash the wizard or count as answers to a missing option — test in Task 4.
- Ingredient list fetch fails offline with no cache: disliked step stays skippable and the wizard can still save — test in Task 5.
- Diet "Vegetarian" with a recipe whose category is "Vegetarian" but contains "chicken stock" must be excluded (ingredients win over category) — test in Task 6.
- Allergy match on ingredient variants ("butter", "unsalted butter", "cheddar cheese") — test in Task 6.

---

### Task 1: API option-list queries (platewise-api)

**Files:**
- Create: `platewise-api/src/recipe-options.ts`
- Create: `platewise-api/migrations/0006_retailers.sql` (`retailers(name TEXT PRIMARY KEY, is_grocery INTEGER NOT NULL CHECK (is_grocery IN (0,1)))`, seeded with the 17 grocery names in the design, exactly as D1 spells them, e.g. `Wholesale Club and Club Entrepôt`, `The Grocery People - TGP`, `Chalo FreshCo`)
- Test: `platewise-api/test/recipe-options.test.mjs`

**Interfaces:**
- Produces: `ingredientOptions(db: D1Database): Promise<{ key: string; name: string; recipeCount: number }[]>` and `cuisineOptions(db: D1Database): Promise<{ name: string; recipeCount: number }[]>`; both sorted by name (case-insensitive); `proteinOptions(db): Promise<{ name: string; categories: string[]; recipeCount: number }[]>` (sorted by name, Plant-based last); `storeOptions(db, market: string): Promise<{ name: string; offerCount: number }[]>` (sorted by offerCount desc).

- [ ] **Step 1: Write the failing test** with a fake `db` whose `prepare(sql).all()` returns fixed rows; assert the mapped output:
```js
test('maps ingredient rows', async () => {
  const db = fakeDb([{ key: 'egg', name: 'Eggs', recipeCount: 120 }, { key: 'basil', name: 'Basil', recipeCount: 30 }]);
  assert.deepEqual(await ingredientOptions(db), [{ key: 'basil', name: 'Basil', recipeCount: 30 }, { key: 'egg', name: 'Eggs', recipeCount: 120 }]);
});
test('maps cuisines and drops empty areas', async () => {
  const db = fakeDb([{ name: 'Italian', recipeCount: 60 }, { name: null, recipeCount: 3 }, { name: 'Canadian', recipeCount: 14 }]);
  assert.deepEqual(await cuisineOptions(db), [{ name: 'Canadian', recipeCount: 14 }, { name: 'Italian', recipeCount: 60 }]);
});
```
  - `proteinOptions` from category rows Beef 95, Dessert 168, Vegetarian 100, Vegan 7 → `[{name:'Beef',categories:['Beef'],recipeCount:95},{name:'Plant-based',categories:['Vegetarian','Vegan'],recipeCount:107}]`.
  - `storeOptions` maps rows to `{name, offerCount}` with names trimmed (`'Chalo FreshCo '` → `'Chalo FreshCo'`), and its SQL joins `retailers` on `trim(offers.retailer) = retailers.name AND is_grocery = 1`, filters `location = ?` and `valid_until IS NULL OR valid_until >= date('now')` (assert the bound market argument).
- [ ] **Step 2:** `cd platewise-api && npm test` → FAIL (module missing).
- [ ] **Step 3: Implement.** Ingredients SQL: group `recipe_ingredients` by `ingredient_key`; `recipeCount` = `COUNT(DISTINCT source || ':' || source_id)`; `name` = the most frequent `name` for that key (ties: alphabetical first). Cuisines: `SELECT area, COUNT(*) FROM recipes WHERE area IS NOT NULL AND trim(area) <> '' GROUP BY area`. Sort in JS as well so the fake proves the order. Protein categories: `Beef, Chicken, Goat, Lamb, Pork, Seafood`; plant: `Vegetarian, Vegan`.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `Add recipe option queries`.

### Task 2: Public option endpoints (platewise-api)

**Files:**
- Modify: `platewise-api/src/index.ts` (routes, before the 404)
- Modify: `platewise-api/README.md` (document both endpoints)
- Test: `platewise-api/test/recipe-options.test.mjs`

**Interfaces:**
- Consumes: Task 1 functions.
- Produces: `GET /v1/recipes/ingredients` → `{ ingredients }`; `/v1/recipes/cuisines` → `{ cuisines }`; `/v1/recipes/proteins` → `{ proteins }`; `/v1/stores?market=calgary` → `{ stores }` (missing or unknown market → 400 `{error:'Invalid market'}`, using the same market check as `/v1/offers`); `OPTIONS` on all four → 204 with CORS headers.

- [ ] **Step 1: Write the failing test** calling the Worker's `fetch` with a fake env: assert status 200, body shape, `Cache-Control` = `public, max-age=86400`, `Access-Control-Allow-Origin` = `*`; and `POST /v1/recipes/ingredients` → 404 (unchanged fallthrough).
- [ ] **Step 2:** `npm test` → FAIL.
- [ ] **Step 3: Implement** a `publicJson(body)` helper next to `json` with the two headers above; leave every existing route's `no-store` unchanged.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Ask the user before applying migration 0006 remotely and deploying. After approval: `npx wrangler d1 migrations apply DB --remote`, `npx wrangler deploy`, then poll `curl -s .../v1/recipes/cuisines` until it returns the new body; expect 20+ cuisines, ~938 ingredients, 7 proteins, ~17 stores.
- [ ] **Step 6:** Commit `Add public recipe option endpoints`.

### Task 3: Profile fields and storage (app)

**Files:**
- Modify: `logic/profile/types.ts`, `logic/profile/profileState.ts`, `logic/profile/profileStorage.ts`, `logic/profile/profileSelectors.ts`
- Create: `supabase/migrations/20261107000000_add_recipe_preferences.sql`
- Test: `logic/profile/profileState.spec.ts`, `logic/profile/profileSelectors.spec.ts`, `logic/profile/profileStorage.account.spec.ts`

**Interfaces:**
- Produces: `Profile` gains `cuisines: string[]`, `proteins: string[]`, `dislikedIngredients: string[]`; `ProfileListField` includes them; `createProfile` defaults them to `[]`.

- [ ] **Step 1: Write failing tests:**
  - `parseStoredProfile` of a JSON profile lacking the three fields returns a profile with them as `[]` (not `null`).
  - `getProfileCompletion` counts exactly 7 areas: household, cuisines, proteins, dislikedIngredients, allergies, dietaryPreferences, preferredStores (a profile with only savingsGoal set → 0).
  - `getProfileSummary` omits savings goal and meal planning; shows `Cuisines: …`, `Proteins: …`, `Avoids: …` lines.
  - Account load maps `cuisines`, `proteins`, `disliked_ingredients` columns; save writes them.
- [ ] **Step 2:** `npx vitest run logic/profile` → FAIL.
- [ ] **Step 3: Implement.** `parseStoredProfile` requires the original four list fields and fills the three new ones with `[]` when missing. Migration: `alter table public.profiles add column cuisines text[] not null default '{}', add column proteins text[] not null default '{}', add column disliked_ingredients text[] not null default '{}';`
- [ ] **Step 4:** `npm test` → PASS (vitest + tsc).
- [ ] **Step 5:** Commit `Add recipe preference fields to profile`. Do not push the migration to Supabase without the user's go-ahead.

### Task 4: Wizard steps (app)

**Files:**
- Modify: `logic/profile/profileWizard.ts`, `logic/profile/profileSetup.ts`
- Test: `logic/profile/profileWizard.spec.ts`, `logic/profile/profileSetup.spec.ts`

**Interfaces:**
- Consumes: Task 3 fields.
- Produces: `ProfileWizardStep` gains `kind: 'name' | 'options' | 'search'`; `ProfileOptionField` = `householdSize | cuisines | proteins | dislikedIngredients | allergies | dietaryPreferences | preferredStores`. The `cuisines` step has `options` filled at runtime (Task 5); `dislikedIngredients` is `kind: 'search'`.

- [ ] **Step 1: Write failing tests:**
  - `PROFILE_WIZARD_STEPS.map(s => s.field)` equals `['displayName','householdSize','cuisines','proteins','dislikedIngredients','allergies','dietaryPreferences','preferredStores']`.
  - Group of each step matches Global Constraints; `PROFILE_WIZARD_GROUPS[2].label === 'Where you shop'`.
  - Allergy and diet option arrays equal the Global Constraints lists exactly; cuisines, proteins and stores start as `['No preference']`.
  - `isWizardStepAnswered` for `dislikedIngredients` is `true` with no selection (skippable, like name).
  - Editing a profile with `dietaryPreferences: ['High protein','Vegetarian']` and `preferredStores: ['Metro']`: initial selections keep only values present in the step's options (`['Vegetarian']`, `[]`); stored hidden values are not deleted from the profile on save unless the user changed that step.
  - For `preferredStores`, cuisines and proteins (lists fetched from D1), saved values missing from this week's list are still offered as selected options when editing, so a store with no current flyer is not silently dropped; only `'Metro'`-style values from the old Ontario list (`Metro`, `Food Basics`) are filtered out.
- [ ] **Step 2:** `npx vitest run logic/profile` → FAIL.
- [ ] **Step 3: Implement** the new step list; group descriptions: about "Sets how many servings we plan.", food "Shapes which recipes we suggest and keeps allergens out.", shopping "Which Calgary flyers we check first.". Add `dislikedIngredients` to `OPTIONAL_FIELDS`. `cuisines`, `proteins` and `preferredStores` get `options: ['No preference']` as the static fallback.
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `Rebuild profile wizard around recipe preferences`.

### Task 5: Option lists from the API, and wizard UI (app)

**Files:**
- Create: `logic/recipes/recipeOptions.ts`
- Modify: `app/profile-interview.tsx`, `app/(tabs)/profile.tsx`, `.env.example` (or README env section)
- Test: `logic/recipes/recipeOptions.spec.ts`

**Interfaces:**
- Consumes: Task 2 endpoints; Task 4 `kind`.
- Produces: `loadRecipeOptions(fetchFn = fetch, storage = AsyncStorage): Promise<{ ingredients: IngredientOption[]; cuisines: string[]; proteins: ProteinOption[]; stores: string[]; source: 'network' | 'cache' | 'none' }>` (all four fetched together; `ProteinOption = { name: string; categories: string[] }`); `searchIngredients(list: IngredientOption[], query: string, limit = 20): IngredientOption[]`; `type IngredientOption = { key: string; name: string; recipeCount: number }`. Base URL from `process.env.EXPO_PUBLIC_PLATEWISE_API_URL`.

- [ ] **Step 1: Write failing tests:**
  - Network success stores the payload under key `platewise.recipeOptions.v1` and returns `source: 'network'`.
  - Network failure with a cached copy returns it with `source: 'cache'`.
  - Network failure, no cache → `{ ingredients: [], cuisines: [], proteins: [], stores: [], source: 'none' }` (no throw).
  - One of the four requests failing is treated as a failure of the whole load (use cache if present), so the wizard never mixes fresh and stale lists.
  - `searchIngredients(list, 'chee')` matches by case-insensitive substring of `name`, ranks prefix matches first, then higher `recipeCount`; empty query returns `[]`.
- [ ] **Step 2:** `npx vitest run logic/recipes` → FAIL.
- [ ] **Step 3: Implement** the module, then the UI: the wizard loads options on mount; the cuisines, proteins and stores steps show `['No preference', ...list]`; the `search` step renders a text input, up to 20 results as chips, and the selected chips (showing `name`, storing `key`). When `source === 'none'` the search step shows "Ingredient list is unavailable right now. You can skip this and add it later from your profile." The profile tab shows the same steps for editing.
- [ ] **Step 4:** `npm test` → PASS; then run the app (web) against the deployed API, complete the wizard, and confirm the saved profile holds ingredient keys.
- [ ] **Step 5:** Commit `Load recipe options from PlateWise API`.

### Task 6: Recipe matching rules (app)

**Files:**
- Create: `logic/recipes/profileMatch.ts`, `logic/recipes/ingredientTags.ts`
- Test: `logic/recipes/profileMatch.spec.ts`

**Interfaces:**
- Consumes: Task 3 `Profile`.
- Consumes: `ProteinOption[]` from Task 5 to map protein names to categories.
- Produces: `type MatchableRecipe = { id: string; area: string | null; category: string | null; ingredientKeys: string[] }`; `matchRecipes<T extends MatchableRecipe>(recipes: T[], profile: Profile, proteins: ProteinOption[]): T[]` (excluded removed, rest ordered by score, stable); `ingredientTags(key: string): { allergens: string[]; groups: ('meat'|'pork'|'beef'|'lamb'|'chicken'|'fish'|'seafood'|'dairy'|'egg'|'honey')[] }`.

- [ ] **Step 1: Write failing tests:**
  - Allergy Dairy excludes recipes with `butter`, `unsalted butter`, `cheddar cheese`, `milk`; Gluten excludes `plain flour`, `spaghetti`; Shellfish excludes `prawns`; Fish excludes `salmon`.
  - Vegetarian excludes a category "Vegetarian" recipe containing `chicken stock`; Vegan also excludes `egg`, `honey`; Pescatarian keeps `salmon`, drops `bacon`; No pork drops `bacon`, `pork`; No beef drops `beef mince`.
  - Disliked `['coriander']` excludes recipes containing key `coriander`.
  - Ranking: cuisines `['Italian']` + proteins `['Chicken']` puts an Italian chicken recipe before an Italian beef one before a Mexican beef one; "No preference" and empty lists change nothing; exclusions are never relaxed when nothing ranks.
- [ ] **Step 2:** `npx vitest run logic/recipes` → FAIL.
- [ ] **Step 3: Implement.** `ingredientTags` uses word-match rules over the key (e.g. any key containing the word `butter`, `cheese`, `milk`, `cream`, `yogurt` → Dairy), kept as one table in `ingredientTags.ts`. Score = +2 cuisine match, +1 per matching protein group (a recipe whose category is in the selected protein's `categories` also counts).
- [ ] **Step 4:** `npm test` → PASS.
- [ ] **Step 5:** Commit `Add profile-based recipe matching`. Also update `docs/profile-interview-requirements.md` "Current implementation status".
