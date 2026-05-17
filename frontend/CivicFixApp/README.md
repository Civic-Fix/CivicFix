# Civic Fix App

A mobile-first Expo React Native application for the CivicFix platform.
This app supports mobile and web via Expo, provides civic issue reporting feeds, update timelines, comments, voting, and issue detail navigation.

## Architecture

- **Framework:** Expo + React Native
- **Platform targets:** iOS, Android, Web
- **State management:** React `useState`, `useEffect`, `useCallback`
- **Persistent storage:** `@react-native-async-storage/async-storage`
- **Networking:** Fetch API and `axios` where needed
- **UI components:** custom components in `./components`
- **Configuration:** `./config.js` centralizes API base URL and share URL logic

## Core features

- Authentication flows: login and signup
- Main feed tabs:
  - `For You` — all civic issue posts
  - `My Posts` — issues created by the current user
  - `Updates` — all issue progress updates
  - `My Updates` — updates for issues owned by the current user
- Issue detail page with:
  - issue summary and status
  - image carousel for attachments
  - comments section
  - timeline-style update feed
  - voting and sharing
- Search experience with live query handling
- Create new issue post flow
- Notification and assistant sections for additional app content

## Folder structure

- `App.jsx` — root application, navigation state, data loading, and event handlers
- `config.js` — API and share URL configuration
- `components/` — reusable UI screens and widgets:
  - `Feeds.jsx` — feed tabs and update list
  - `Post.jsx` — issue detail and timeline
  - `Login.jsx`, `Signup.jsx` — auth UI
  - `CreatePost.jsx` — report creation
  - `SearchScreen.jsx` — search results
  - `Notifications.jsx`, `CivicAssistant.jsx`, `CommentForm.jsx`
- `services/` — API integration helpers:
  - `updatesService.js` — fetch all updates and issue updates
- `utils/` (if present) — shared formatting logic and helpers

## Tech stack

- `expo` ~54
- `react` 19.1
- `react-native` 0.81
- `react-native-safe-area-context`
- `@react-native-async-storage/async-storage`
- `expo-location`, `expo-image-picker`
- `expo-status-bar`
- `react-native-web` for web support

## Setup

1. Install dependencies:
   ```bash
   cd frontend/CivicFixApp
   npm install
   ```

2. Start the Expo app:
   ```bash
   npm run start
   ```

3. Open the app:
   - Use the Expo Dev Tools to run on Android or iOS simulators
   - Or run on the web with `npm run web`

## Backend requirements

This app expects the backend API to be running and reachable at:

- `http://localhost:5001/api`

The API URL is configured in `config.js`, with optional override via the environment variable:

- `EXPO_PUBLIC_API_BASE_URL`

The backend should expose routes including:

- `/issues`
- `/issues/:id`
- `/issues/updates`
- `/issues/:id/updates`
- `/comments`
- `/issues/:id/votes`

## Implementation notes

- `App.jsx` owns the main application state and coordinates data loading, navigation, and action handlers.
- `Feeds.jsx` renders the feed tabs, update cards, and applies modern press/hover styling.
- `Post.jsx` renders the selected issue details, comment list, and timeline-style update cards.
- `updatesService.js` provides both global update and issue-specific update fetching.
- `config.js` resolves the API endpoint and share URL for local and environment-driven setups.

## Recommended workflow

- Start the backend first: `cd backend && npm run dev` (or equivalent)
- Then start the Expo app from this directory
- Use Expo web for quick browser previews and mobile targets for native behavior

## Notes

- The app currently uses `localhost` for backend API access by default.
- If you want production web hosting, update `config.js` or set `EXPO_PUBLIC_API_BASE_URL` appropriately.
- The app expects Supabase-backed auth and issue data from the backend.

---

For backend architecture, database migrations, and API route behavior, see the `backend/` directory in the root repository.
