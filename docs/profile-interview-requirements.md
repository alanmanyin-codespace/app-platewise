# Profile Interview Requirements

## Purpose

Create a user profile that helps All About Savings personalize grocery recommendations and meal planning.

The first version should gather the user’s preferences through a centralized, option-based setup workflow in the general app UI. The profile should then be created and stored when the user saves the setup, or from available login information when the user signs in.

## User scenario

1. A new user opens the app.
2. The app opens one profile setup screen with grouped preference sections.
3. The user selects options for grocery savings, allergies, dietary preferences, meal planning, and stores.
4. The user can optionally enter a name and save a partially completed profile.
5. The app stores the profile locally and uses the selected allergies to filter recipe suggestions.
6. If the user logs in, the profile is associated with that login identity and can be reused across sessions.
7. The user can later review or update their preferences from the profile area.

## Initial profile goals

The profile should initially support these areas:

- Grocery savings preferences
- Allergy exclusions
- Dietary preferences
- Meal-planning preferences
- Preferred grocery stores

## Centralized setup UI

The setup screen should use a single scrollable workflow with:

- A short explanation of how preferences will be used
- An optional name field
- Grouped option sections for each profile area
- Single-select options for household size and savings goal
- Multi-select options for allergies, dietary preferences, meal planning, and stores
- Explicit `None` and `No preference` options that are exclusive of other choices
- A visible completion indicator
- A single save action

The flow should feel like a quick, centralized preference setup rather than a chat or multi-page form.

## Profile creation behavior

- The profile should support partial completion and later editing.
- Selections should be saved together when the user presses the save action.
- Login information should be used as the profile identity when a user is authenticated.
- Anonymous users should be able to configure and save preferences before login requirements are finalized.
- The profile should be editable after creation.

## Information to explore during the interview

The initial setup should offer these fields:

- Name or preferred form of address
- Household size
- Grocery savings goals or budget sensitivity
- Allergies and dietary exclusions
- Meal-planning preferences
- Preferred stores

The name is optional. Other fields can be left blank and completed later.

## Out of scope for the preliminary UI

- Production backend persistence implementation
- Authentication provider integration
- Production recommendation algorithms
- Complete onboarding and account recovery flows

## Open decisions

- Which profile fields should become required before recommendations are shown?
- What login provider and identity model will be used?
- Where should anonymous profiles be stored, and how should they merge with a logged-in profile?
- Which profile fields should directly affect grocery deals, meal plans, and store recommendations?
- Should additional preference groups be added to the centralized setup screen?

## Current implementation status

The profile state, local persistence, profile review/edit screen, and centralized option-based setup workflow are implemented on the feature branch. Backend identity association remains future work.
