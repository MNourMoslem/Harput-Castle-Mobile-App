# Harput Rehberi

Harput Rehberi is an Expo-based mobile application focused on exploring Harput Castle and its surrounding historical locations. The current codebase already includes the main app shell, localized content loading, offline persistence, and several user-facing screens. Some screens and parts of the content are still placeholders or temporary mock material.

## Repository Scope

This repository currently contains a single app:

- `mobile/` - the Expo Router mobile application

## What The App Already Does

- Shows a home screen with a full-screen hero image, welcome copy, language switching, and a visited-places progress summary
- Lists historical locations in the map tab through place cards and opens a detail overlay for the selected place
- Loads a gallery experience with incremental image loading, refresh support, and a full-screen viewer
- Provides a quiz flow with persistent progress, resume support, restart support, and result tracking
- Displays history chapters and opens a detail screen for each chapter
- Supports Turkish and English UI strings and locale-specific content loading
- Stores locale choice, quiz progress, and per-place user preferences locally with AsyncStorage

## Current Status

The application structure is ahead of the content state.

- The app is already wired as a Harput-focused guide
- Some data and media scaffolding are present for richer historical content
- Parts of the current bundled content are still temporary, generated, or incomplete
- The AR, Assistant, and Lens experiences are not implemented beyond placeholder screens

## Architecture Summary

The app uses Expo Router for file-based navigation. The root route redirects into a tab group, and the root layout wraps the app with three providers:

- `LocaleProvider` for language selection and translation lookup
- `UserPrefsProvider` for favorites, visited state, rating, and notes per place
- `QuizProvider` for persistent quiz sessions

Content is bundled inside `mobile/data/content` as JSON and loaded through a registry layer. Locale fallback is handled in code, with `en` as the default locale. There is no backend service in the current version of the app.

## Main Screens

- `Home` - landing screen with the current visual identity and progress summary
- `Map` - place browser with place cards and detail overlay
- `Gallery` - image grid and full-screen viewer
- `Quiz` - timed quiz with saved progress
- `History` - chapter list and detail pages
- `AR` - placeholder
- `Assistant` - placeholder
- `Lens` - separate stack route, currently placeholder

## Data And Persistence

- Content source: bundled JSON files under `mobile/data/content`
- Supported locales: English and Turkish
- Locale persistence: AsyncStorage
- Quiz persistence: AsyncStorage
- Per-place user data persistence: AsyncStorage
- Content loading pattern: registry-based lookup with locale fallback

The codebase already anticipates richer place experiences. Some place detail data structures include fields for assets such as audio and 3D models, but those flows are not yet surfaced in the UI.

## Technology Stack

- Expo 54
- React 19
- React Native 0.81
- Expo Router
- AsyncStorage
- Expo Localization
- Expo Image
- React Native Maps is installed, but the current map tab is a place browser rather than an interactive map view

## Project Layout

```text
.
├── README.md
├── NEXT-STEPS.md
└── mobile/
    ├── app/
    ├── components/
    ├── constants/
    ├── contexts/
    ├── data/
    ├── locales/
    ├── services/
    ├── types/
    └── package.json
```

Important folders inside `mobile/`:

- `app/` - routes and screen entry points
- `components/` - reusable UI and feature components
- `contexts/` - app-wide state providers
- `data/content/` - bundled locale-specific content and media references
- `locales/` - UI translation namespaces
- `services/` - content access, localization, gallery, quiz, history, and user preference helpers
- `types/` - shared TypeScript types

## Getting Started

### Prerequisites

- Node.js
- npm
- Expo-compatible development environment for Android, iOS, or web

### Install And Run

```bash
cd mobile
npm install
npm run start
```

Useful scripts:

- `npm run start` - start the Expo development server
- `npm run android` - open the app on Android
- `npm run ios` - open the app on iOS
- `npm run web` - open the app on web
- `npm run lint` - run Expo linting

## Known Gaps

- Real Harput content still needs a full pass across place details, history, and quiz material
- AR, Assistant, and Lens are not implemented yet
- The installed maps dependency is not yet used for a full interactive map experience
- Local user data is only stored on-device; there is no backend sync

## Next Planning Document

See `NEXT-STEPS.md` in the repository root for a focused breakdown of what is already implemented, what is planned next, and what is still missing.