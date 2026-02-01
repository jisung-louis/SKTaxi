# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

SKURI Taxi is a React Native mobile app for Sungkyul University students combining taxi ride-sharing, university notices, community board, and chat features.

**Stack:** React Native 0.79.2 · React 19 · TypeScript 5 · Firebase (Auth/Firestore/Functions/Messaging/Storage)

## Common Commands

```bash
# Development
yarn start              # Metro bundler
yarn android            # Build and run Android
yarn ios                # Build and run iOS simulator

# Quality
yarn lint               # ESLint check (required before PR)
yarn test               # Jest tests

# Cloud Functions (in functions/ directory)
cd functions && npm run build && firebase deploy --only functions

# Operational scripts
node scripts/manage-app-version.js    # iOS/Android version control
node scripts/manage-app-notices.js    # App notice CRUD
node scripts/upload-notices.js        # Sync university notices
```

## Architecture

### Navigation Structure
- **RootNavigator**: Auth state routing → MainNavigator or AuthNavigator
- **MainNavigator**: Bottom tabs (Home/Taxi/Notice/Board/Chat), each with its own native stack
- Tab bar auto-hides on nested screens

### Data Layer
- `src/hooks/` - Firestore subscription hooks (useParties, useNotices, useChatMessages, etc.)
- `src/contexts/` - Global state (AuthContext, JoinRequestContext)
- `src/lib/` - External integrations (notifications, analytics, minecraft)

### Key Patterns
- Firestore is the single source of truth; schema documented in `docs/firestore-data-structure.md`
- Cloud Functions in `functions/src/index.ts` handle triggers, FCM push, and data consistency
- Design tokens in `src/constants/` (COLORS, TYPOGRAPHY)

### Project Structure
```
src/
  screens/      Tab screens (HomeTab/, TaxiTab/, NoticeTab/, BoardTab/, ChatTab/, auth/)
  components/   Reusable UI components
  hooks/        Firestore subscription hooks (~30 hooks)
  contexts/     Auth, JoinRequest global state
  lib/          notifications, fcm, analytics, minecraft
  utils/        Date, chat, settlement utilities
  config/       Firebase/Google Sign-In setup
  constants/    Design tokens, app constants
  types/        TypeScript definitions
functions/      Firebase Cloud Functions (Node 22)
scripts/        Firestore data management CLI tools
docs/           Specs, guides, legal documents
```

## Development Guidelines

1. **Firestore changes**: Always update `docs/firestore-data-structure.md` first before modifying collections/fields
2. **Lint check**: Run `yarn lint` after modifications - warnings should not be ignored
3. **Latest docs**: Reference official documentation (2025-11 baseline)
4. **Ambiguous requirements**: List clarifying questions with your recommendations before implementing

## Firebase Configuration

- Android: `android/app/google-services.json`
- iOS: `ios/SKTaxi/GoogleService-Info.plist`
- Functions require `firebase login` and Node 22 runtime
- Firestore security rules in `firestore.rules`

## Key Documentation

- `docs/firestore-data-structure.md` - Firestore schema (single source of truth)
- `docs/SKTaxi-backend-spec.md` - Mobile-backend API contract
- `docs/android-build-guide.md` - Android build/deploy checklist

## 복잡한 질문이나 작업은 sequential-thinking mcp를 사용해서 step by step으로 문제를 해결해줘.