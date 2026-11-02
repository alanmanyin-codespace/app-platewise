# PlateWise

PlateWise is a grocery savings and meal-planning app for web, iOS, and Android. It brings together recipe discovery, a weekly planner, a grocery list, and pantry tracking in an Expo application.

> **Current data:** Recipes, store references, and flyer prices shown in the app are examples. They are not live grocery offers or verified current prices. The app does not currently display data from the separate flyer collector.

## Demo

[Open the PlateWise demo](https://app-platewise.vercel.app/)

## What is in the app

- Browse sample recipes and filter them by store or allergens.
- View recipe details, add ingredients to a grocery list, and plan meals.
- Track pantry items and use pantry quantities when planning shopping.
- Set up a profile and preferences as a guest or with an account.
- Sign in with email or Google when Supabase authentication is configured.

The [flyer collector](https://github.com/alanmanyin-codespace/platewise-flyer-collector) is a separate experimental project. Live flyer ingestion and integration into this app are not implemented. Permission to automate or publish data from any provider must be confirmed before doing so.

## Technology

- [Expo](https://expo.dev/) and React Native, with Expo Router for navigation
- TypeScript and Jotai for application state
- AsyncStorage for local persistence and Supabase for account features
- Vitest and TypeScript for tests and type checking

## Getting started

### Prerequisites

- Node.js **22.22.1** (see [.nvmrc](.nvmrc)); the project requires Node 22.22.1 or later within Node 22.
- npm; the project specifies npm 11.6.2.
- For native development, an iOS simulator, Android emulator, or a compatible device with the appropriate Expo development setup.

### Install and run

```bash
git clone https://github.com/alanmanyin-codespace/app-platewise.git
cd app-platewise
npm install
npm run web
```

For the Expo development server and other targets:

```bash
npm start          # Open the Expo development server
npm run ios        # Start the iOS target
npm run android    # Start the Android target
```

### Optional: account configuration

The app can be explored without Supabase configuration. To enable account-backed features, provide these values in a local `.env.local` file:

```dotenv
EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY=your-publishable-key
```

Use a Supabase **publishable** key only: `EXPO_PUBLIC_` variables are embedded in the client and are not secrets. Never place a service-role key or other secret in the app. Account features also require a configured Supabase project, the applicable [database migrations](supabase/migrations/), and the relevant authentication providers and redirect URLs. The precise provider configuration depends on your deployment.

Guest profiles and pantry data use local storage. Signed-in profile data uses Supabase when configured. See the application code and migrations for current persistence and access rules.

## Development commands

| Command | Purpose |
| --- | --- |
| `npm start` | Start the Expo development server. |
| `npm run web` | Start the web target. |
| `npm run ios` / `npm run android` | Start a native target. |
| `npm test` | Run the Vitest suite and TypeScript type checking. |
| `npm run lint` | Run Expo lint. |
| `npm run build` | Export the Expo application. |

## Project structure

```text
app/        Expo Router screens and navigation
components/ Reusable interface components
logic/      Application state, authentication, recipes, profiles, and pantry logic
lib/        Shared helpers and presentation utilities
assets/     Images and other bundled assets
supabase/   Database migrations
docs/       Product requirements and reference material
```

## Project documents

- [Profile interview requirements](docs/profile-interview-requirements.md)
- [Pantry feature notes](docs/features/pantry-todo.md)
- [Pitch deck](docs/PlateWise_Pitch_Deck.md)

These documents may describe plans as well as implemented features; the application code is the source of truth for current behavior.
