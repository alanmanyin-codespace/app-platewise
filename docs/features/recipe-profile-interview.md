# Recipe-linked profile interview

## Why

PlateWise now has 793 real recipes (TheMealDB, stored in Cloudflare D1 by platewise-api) and live Calgary flyer offers. Today the profile wizard asks seven questions, but only the allergy answer is used, and only against five hand-written sample recipes. Several answers (savings goal, meal planning, "High protein", "Low carb", "Quick meals") cannot be backed by the recipe data, which has no cooking time or nutrition.

The interview should ask only what either describes the person or changes which recipes and deals they see, so every answer visibly does something.

## Goals

- The app is restricted to Calgary for now; store options are Calgary stores.
- The wizard asks, in this order:
  1. Name (optional)
  2. Household size: 1, 2, 3, 4+
  3. Cuisines you enjoy (multi-select)
  4. Preferred proteins (multi-select)
  5. Ingredients you dislike (search and pick)
  6. Allergies (multi-select)
  7. Diet (multi-select)
  8. Preferred stores (multi-select)
- Cuisines, preferred proteins and disliked ingredients come right after the "about you" questions, as the user asked.
- Each answer has a defined effect on recipes (see Recipe effects).

## Non-goals

- Savings goal and meal planning are hidden, not deleted. The steps are removed from the wizard, profile completion and the profile summary. Existing stored values stay in the profile and database untouched, so they can return later.
- "High protein", "Low carb" and "Quick meals" are removed from the options for now.
- No nutrition, cooking-time, or price-per-serving calculations.
- Serving the 793 recipes to the app (a public read endpoint on platewise-api) and matching ingredients to offers are separate pieces of work. This design defines the rules they must follow; it does not build them.

## Anti-goals

- An option that the app silently ignores. If an option has no effect on recipes, it is not shown.
- A recipe containing a selected allergen or disliked ingredient shown to the user.

## Questions and options

| Step | Field | Options | Select |
|---|---|---|---|
| Name | `displayName` | free text, optional | – |
| Household size | `householdSize` | 1, 2, 3, 4+ | single |
| Cuisines you enjoy | `cuisines` (new) | No preference, plus the TheMealDB areas present in D1 (e.g. American, British, Canadian, Chinese, French, Greek, Indian, Italian, Japanese, Mexican, Thai, …) | multi |
| Preferred proteins | `proteins` (new) | No preference, plus the protein categories in D1 recipes: Beef, Chicken, Goat, Lamb, Pork, Seafood, and Plant-based (Vegetarian + Vegan categories) | multi |
| Ingredients you dislike | `dislikedIngredients` (new) | search over the ingredient list built from the recipes (938 names); None | multi |
| Allergies | `allergies` | None, Peanuts, Tree nuts, Dairy, Gluten, Shellfish, Fish, Eggs, Soy, Sesame | multi |
| Diet | `dietaryPreferences` | No preference, Vegetarian, Vegan, Pescatarian, No pork, No beef | multi |
| Preferred stores | `preferredStores` | No preference, plus the grocery retailers that currently have Calgary offers in D1 (see Option lists) | multi |

"None" and "No preference" remain exclusive of other choices, as today.

Wizard groups: "About you" (name, household), "What you eat" (cuisines, proteins, disliked ingredients, allergies, diet), "Where you shop" (stores).

## Recipe effects

Exclusions (recipe never shown):
- **Allergies**: a recipe is excluded if any ingredient maps to a selected allergen. The mapping is a fixed table from ingredient keys to allergens (e.g. milk, butter, cheese → Dairy; flour, pasta, bread → Gluten; prawns → Shellfish).
- **Diet**: Vegetarian excludes recipes with any meat or fish ingredient; Vegan also excludes dairy, eggs and honey; Pescatarian excludes meat but allows fish/seafood; No pork / No beef exclude recipes with those ingredients. TheMealDB's Vegetarian and Vegan categories count as matching but the ingredient check still applies.
- **Disliked ingredients**: excluded if any ingredient key equals a disliked key.

Ranking (recipe shown, moved up):
- **Cuisines**: recipe area is in the selected cuisines.
- **Proteins**: recipe contains an ingredient of a selected protein group (or its category matches, e.g. Chicken, Beef, Seafood).
- **Stores**: recipe has ingredients on sale at a preferred store (once offer matching exists).

When nothing matches the ranking preferences, recipes still show; exclusions are never relaxed.

**Household size** scales displayed recipe servings and the quantities added to the grocery list.

## Storage

- Add `cuisines`, `proteins`, `dislikedIngredients` (string arrays, default empty) to the `Profile` type, local storage, and a new Supabase migration on `profiles`.
- Store canonical values (ingredient keys as built by platewise-api's `ingredientKey`, cuisine area names, protein labels), not display text, so matching is exact.
- Profile completion counts the shown steps only (household, cuisines, proteins, disliked, allergies, diet, stores).

## Decided by the builder (Claude's calls, please check)

- Exclusions are hard filters, cuisines/proteins/stores are ranking only. The user did not choose between "move up" and "hide"; ranking is the default.
- Fish and Sesame added to allergies; Pescatarian, Vegan, No pork, No beef added to diet.
- Stores and proteins come from D1 (user's decision); the grocery list is a curated `retailers` table rather than an offer-count threshold, and Goat is included because it is a recipe category.
- Allergen and diet tables live in shared logic with unit tests, keyed by ingredient key.

## Option lists from platewise-api

The ingredient, cuisine, protein and store lists are fetched from the Cloudflare API (decided by the user), so they follow the monthly recipe import.

- New public, read-only endpoints on platewise-api (no token), reading the existing `recipes` and `recipe_ingredients` tables in D1:
  - `GET /v1/recipes/ingredients` → `{ ingredients: [{ key, name, recipeCount }] }`, sorted by name. `key` is the `ingredientKey` value the profile stores; `name` is a display name.
  - `GET /v1/recipes/cuisines` → `{ cuisines: [{ name, recipeCount }] }`.
- Responses are small (about 938 ingredients) and change monthly, so they are sent with a cache header (e.g. one day) and the app keeps the last good copy locally.
- The disliked-ingredients step searches the fetched list on the device. If the fetch fails and no copy is cached, the step shows a short message and can be skipped; cuisines fall back to "No preference" only.
- `GET /v1/recipes/proteins` → `{ proteins: [{ name, categories, recipeCount }] }`. Built from `recipes.category`: each protein category (Beef, Chicken, Goat, Lamb, Pork, Seafood) is one entry; Vegetarian and Vegan combine into one "Plant-based" entry with `categories: ["Vegetarian","Vegan"]`. Non-protein categories (Dessert, Side, Starter, Breakfast, Pasta, Miscellaneous) are left out. The profile stores `name`.
- `GET /v1/stores?market=calgary` → `{ stores: [{ name, offerCount }] }`, sorted by `offerCount` descending. A store is listed when it is marked as a grocery retailer and has at least one current offer (`valid_until` null or today or later) in that market. The profile stores `name`.
- **Grocery retailers live in D1.** A new `retailers` table (`name` primary key, `is_grocery` 0/1) is seeded by a migration with the Calgary grocery stores seen in the first collection (Real Canadian Superstore, Save-On-Foods, Walmart, Sobeys, Safeway, No Frills, T&T Supermarket, Family Foods, IGA, FreshCo, Chalo FreshCo, H Mart, Wholesale Club, Costco, The Grocery People, Calgary Co-op, M&M Food Market). A pure offer-count threshold does not work: Shoppers Drug Mart (120 offers), Princess Auto (57), Canadian Tire (45) and Long & McQuade (40) would pass it. New retailers seen in later collections are not shown until a row marks them as grocery.
- Retailer names are trimmed before matching (D1 has "Chalo FreshCo " with a trailing space).
- Allergies and diet stay fixed lists in the app: they are PlateWise's own rules, not data in D1.
