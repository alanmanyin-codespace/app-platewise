# PlateWise — Pantry Feature Development TODO

> **Status:** Planned · Tasks are unchecked until implementation is verified.  
> **Related pitch:** [PlateWise Pitch Deck](../reference/pitch-deck.md) — especially Slides 4, 6, 7, and 10.  
> **Goal:** Build a pantry-aware restocking experience that identifies what users already own and adds only missing ingredients to their grocery list.

## P0 — Foundation

- [ ] **Define pantry data models.** Create `PantryItem`, `RecipeRequirement`, and `ProductOffer` types, including quantities, units, and normalized ingredient IDs.
- [ ] **Implement pantry state management.** Use Jotai for pantry inventory state and AsyncStorage to persist changes across application restarts.
- [ ] **Build Pantry Management UI.** Let users add, edit, delete, and view pantry ingredients with quantities and units.

## P0 — Core Logic

- [ ] **Implement ingredient normalization.** Match ingredients by normalized identifiers and convert compatible units (e.g., kg ↔ g and L ↔ ml). Don't combine incompatible units without an explicit conversion rule.
- [ ] **Develop the smart restocking calculator.** Combine requirements across planned recipes, subtract usable pantry stock, and calculate missing quantities. Planning alone must **not** consume inventory.

## P0 — Integration

- [ ] **Integrate with the grocery shopping list.** Generate a shopping list containing only missing ingredients. Consolidate duplicate requirements across recipes and avoid duplicate purchases.

## P1 — Enhancements

- [ ] **Add package-aware pricing.** Match missing ingredient quantities to actual purchasable package sizes and estimate shopping totals using available product prices. Clearly mark demonstration prices.
- [ ] **Synchronize purchases and consumption.** Change pantry quantities only after confirmed purchases or cooking; prevent double-counting when shopping items are checked or revisited.

## P2 — Enhancements

- [ ] **Implement expiration and low-stock tracking.** Support optional expiration dates and stock thresholds; display use-it-soon and low-stock reminders.
- [ ] **Introduce pantry-aware meal recommendations.** Favor recipes that use existing ingredients, particularly food approaching its expiration date.

## Later — AI-Assisted Inventory

- [ ] **Explore barcode scanning and fridge photo recognition.** Evaluate assisted item entry only after the manual inventory and restocking flow have been validated with users.

## P0 — Quality

- [ ] **Add unit tests and acceptance tests.** Cover ingredient matching, unit conversions, duplicate consolidation, partial stock, persistence, and shopping-list calculations.

## First Milestone — Pantry-Aware Restocking MVP

The first milestone is complete when all P0 tasks above are implemented and verified.

**Acceptance criteria**

- [ ] Users can add, update, remove, and view pantry ingredients and quantities.
- [ ] Pantry data survives an application restart.
- [ ] Ingredients in planned recipes are matched to pantry inventory.
- [ ] The restocking engine combines shared ingredients and calculates the correct missing quantities.
- [ ] The shopping list excludes fully covered ingredients and includes partially missing quantities.
- [ ] Building or modifying a meal plan does not prematurely deduct pantry stock.
- [ ] Automated tests cover the calculations and edge cases.

**Out of scope for the first milestone:** Fridge-photo AI, barcode scanning, cloud synchronization, expiry notifications, and live multi-store price optimization.

## Existing Code to Review

- `app/(tabs)/groceries.tsx`
- `app/(tabs)/planner.tsx`
- `logic/actions/addRecipeIngredientsToGroceries.ts`
- `logic/app-state/groceryItemsListAtom.ts`
- `logic/app-state/weeklyPlanAtom.ts`
- `logic/types.ts`
- `logic/profile/profileStorage.ts`

**Implementation note:** The current recipe ingredient shape includes names and prices but lacks a normalized ingredient identifier and structured required quantities. Evolve those contracts before implementing quantity-aware subtraction.
