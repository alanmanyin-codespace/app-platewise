# Profile Interview Requirements

## Purpose

Create a user profile that helps All About Savings personalize grocery recommendations and meal planning.

The first version should gather the user’s preferences through a centered, option-based single-question wizard in the general app UI. The profile should then be created and stored when the user saves the setup, or from available login information when the user signs in.

## User scenario

1. A new user opens the app.
2. The app opens a centered profile wizard with one topic shown at a time.
3. The user selects options for grocery savings, allergies, dietary preferences, meal planning, and stores.
4. The user moves through the wizard with Back and Next controls, then saves a partially completed profile.
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

## Centered single-question wizard

The setup screen should use a focused stepper workflow with:

- One question/topic visible at the center of the page at a time
- A step count and progress bar
- Back and Next navigation
- An optional name step
- Single-select options for household size and savings goal
- Multi-select options for allergies, dietary preferences, meal planning, and stores
- Explicit `None` and `No preference` options that are exclusive of other choices
- A final save action on the last step

The flow should feel like a calm, focused sequence rather than a chat or a dense form.

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
- Should additional preference groups be added to the centered wizard?

## Current implementation status

The profile state, local persistence, profile review/edit screen, and centered option-based wizard are implemented on the feature branch. Backend identity association remains future work.
