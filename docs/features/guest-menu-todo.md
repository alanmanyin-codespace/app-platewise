# PlateWise — Guest Homepage & General Menu TODO

> **Current priority:** P0 — Guest-first, non-profile-based menu experience.  
> **Decision:** Postpone pantry initialization and profile setup/onboarding until after a useful guest browsing and meal-planning experience is available.  
> **References:** [Pitch Deck](../reference/pitch-deck.md) · [Deferred Pantry TODO](pantry-todo.md)  
> **Status:** Planned. Unchecked items have not been verified as delivered.

## Goal

Enable a first-time visitor to open PlateWise and immediately understand its value, browse a useful **general meal menu**, inspect recipes, and try a sample weekly meal plan **without creating a profile, answering an onboarding questionnaire, or signing in**.

The guest menu must work without pantry inventory, saved dietary preferences, household settings, a budget, or an account. Personalization can be added later without redesigning the entire menu experience.

## P0 — Guest Homepage and Menu (next sprint)

- [ ] **Define guest entry behavior.** Users with no local profile and no account can load the home screen and browse immediately. Do not automatically redirect them to `/profile-interview` or sign-in.
- [ ] **Create the general homepage.** Introduce the PlateWise value proposition (“Eat better. Spend less. Waste less.”) with a clear primary entry into meal exploration and a secondary option to try a weekly menu.
- [ ] **Expose a general meal catalog.** Display recipe cards with meaningful titles, images, preparation time, servings, and basic ingredient information. The catalog must not rely on an existing user profile.
- [ ] **Allow meal discovery without personalization.** Provide simple browse/filter controls based on data we actually have (e.g., meal type, preparation time, store if supported). Do not require allergies, preferences, or household data.
- [ ] **Maintain recipe detail navigation.** Guests can open recipes, read ingredients and cooking instructions, and return to the menu. Preserve the existing recipe-detail experience.
- [ ] **Support a sample weekly menu.** Offer a default/example 7-day menu or a simple choose-meals experience; clearly label it as a sample rather than an automatically personalized or optimized plan.
- [ ] **Connect recipes to basic grocery-list actions.** Guests can add recipe ingredients to a shopping list and check them off. No pantry subtraction or user-profile dependency in this phase.
- [ ] **Preserve current navigation.** Keep existing Deals, Meal Plan, Groceries, and Profile functionality accessible while organizing a guest-friendly Home/Discover entry point. Refactor routes rather than delete working functionality.
- [ ] **Make guest UI responsive and accessible.** Cover mobile Expo and web layouts, loading/empty states, readable text, and accessible navigation controls.
- [ ] **Avoid unsupported claims.** Clearly label hardcoded recipes, prices, sale dates, savings figures, and store distances as sample data. Do not claim live flyers, price verification, automatic AI meal generation, or Calgary-local coverage unless actual integrations support those claims.
- [ ] **Test the guest journey.** Verify first launch with no profile, homepage → recipe → meal plan → grocery list navigation, and compatibility with an existing local profile.

## P1 — After the guest experience is stable

- [ ] **Improve general menu organization.** Add useful categories, search, and sorting using the same shared recipe data rather than duplicating datasets across screens.
- [ ] **Let guests build a flexible weekly menu.** Add/remove/swap meals without onboarding; support sensible sample serving sizes and an estimated ingredient list.
- [ ] **Decide guest-state persistence.** Determine which menu/list choices persist locally without an account and communicate clearly what is stored.
- [ ] **Replace demonstration data with reliable Calgary data.** Establish a source for time-stamped grocery prices and flyer offers before presenting deals as current.

## Deferred — Not part of this sprint

- [ ] **Pantry initialization and smart restocking.** Defer pantry inventory, ingredient quantity subtraction, expiry alerts, and pantry-aware recommendations. See [Pantry TODO](pantry-todo.md).
- [ ] **Profile setup and onboarding expansion.** Defer mandatory questionnaires, household personalization, preferred-store onboarding, and sign-in requirements. Existing profile features should remain intact but optional.
- [ ] **Budget optimization and store/trip optimization.** Defer until reliable price data and the general menu flow are stable.
- [ ] **AI-driven meal suggestions or fridge-photo recognition.** Defer until the non-AI guest experience is validated.

## Acceptance criteria for the first milestone

- [ ] A fresh install/guest session reaches a useful homepage without profile creation or sign-in.
- [ ] A guest can browse and view general recipes without preferences, pantry, or budget data.
- [ ] A guest can open a sample weekly menu and access a basic grocery list.
- [ ] No guest-facing page crashes because `profileAtom` is `null`.
- [ ] Existing profile and allergy-preference behavior remains functional for users who already have a local profile.
- [ ] Sample prices and offers are not mislabeled as real-time verified savings.
- [ ] Navigation works on supported Expo/web viewports and is keyboard/screen-reader friendly where applicable.

## Existing code to review

- `app/(tabs)/index.tsx` — currently the Deals entry page, not a general guest homepage.
- `app/(tabs)/planner.tsx` — sample weekly plan presentation.
- `app/(tabs)/groceries.tsx` — grocery-list presentation.
- `app/recipe-detail.tsx` — recipe details.
- `components/DealRecipeCard.tsx`, `components/MealDayCard.tsx`.
- `logic/app-state/weeklyPlanAtom.ts`, `logic/app-state/groceryItemsListAtom.ts`.
- `logic/actions/addRecipeIngredientsToGroceries.ts`.
- `logic/profile/profileState.ts`, `logic/profile/profileStorage.ts` — existing optional local profile behavior.

**Engineering principle:** Build the baseline guest experience first. Future pantry and profile features should enhance the same core recipe/menu model, not be prerequisites for accessing it.
