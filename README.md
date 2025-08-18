# EventMate — Create/Edit Events, attach image, location and reminders

A React Native app built with **Expo SDK 51**, **React Native 0.74**, and **expo-router**.

This README covers install, running, and version-control tips (including ignoring `ios/` and `android/`).

---

## 🗄️ Zustand - State Management

- **Tiny API, minimal code:** create a store with one function—no actions/reducers/slices ceremony.
- **Direct, type-safe updates:** write plain functions; you can keep actions in the same file as state.
- **Great React perf:** selectors and shallow compare keep re-renders low.
- **Side effects where you want them:** do work inside actions or subscribe to state changes—your choice.
- **Middleware when needed:** persist, immer, devtools opt-in without committing to a big framework.

## 💾 Storage - AsyncStorage

- **Works in Expo Go:** no native build required to persist data locally.
- **Battle-tested key–value store:** reliable for caching user prefs and small app data.
- **Drop-in with Zustand:** persist + createJSONStorage(() => AsyncStorage) hydrates on app start.
- **Easy to swap later:** if you need more speed, you can swap the storage adapter (e.g., MMKV) without changing the store API.

---

## 📦 Prerequisites

- **Node.js**: v18 or v20 recommended
- **Android**: Android Studio + SDKs, an emulator/device, **JDK 17**
- **iOS (macOS)**: Xcode + iOS Simulator, **CocoaPods** (`sudo gem install cocoapods`)

### Install Expo command‑line tools

You can use the locally installed CLI through `npm run …` scripts, or install Expo’s CLI globally:

```bash
npm install -g expo
expo --version   # verify
# (Optional) Cloud builds / dev builds
npm install -g eas-cli
```

> You can always use `npx expo <cmd>` instead of installing globally.

---

## 🚀 Install & Run

```bash
# 1) Install dependencies
npx expo install

# 2) Start Metro (dev server)
npx expo start -c   # or: npm run start

# 3) Run native dev builds (needed because we use native modules)
# iOS (macOS only)
npx expo run:ios    # or: npm run ios

# Android
npx expo run:android   # or: npm run android

# 4) Web (optional)
npx expo start --web   # or: npm run web
```

**Scripts (from package.json)**

| Script      | Command            | What it does                           |
| ----------- | ------------------ | -------------------------------------- |
| `start`     | `expo start -c`    | Starts Metro with cache clear          |
| `android`   | `expo run:android` | Prebuild + run Android app (dev build) |
| `ios`       | `expo run:ios`     | Prebuild + run iOS app (dev build)     |
| `web`       | `expo start --web` | Runs the project in a web browser      |
| `typecheck` | `tsc --noEmit`     | Type-checks the codebase               |

> Because this app uses **react-native-maps**, **react-native-reanimated**, and **expo-notifications**, **Expo Go is not sufficient**. Use the `run:*` commands which create a custom dev build.

---

## 🧩 Routing

- Entry is `"main": "expo-router/entry"` in `package.json`. Screens live under `app/`.

---

Regenerate native projects at any time:

```bash
npx expo prebuild --clean
```

---

## ⚙️ Notes & Tips

- **Reanimated**: Ensure `'react-native-reanimated/plugin'` is the **last** entry in `babel.config.js` plugins.
- **Maps**: Provide a Google Maps API key (Android) via `app.json` → `expo.android.config.googleMaps.apiKey`. iOS Google Maps requires extra setup; Apple Maps works by default.
- **Permissions**: Request runtime permissions for Location/Notifications in code. iOS usage strings go in `app.json` → `expo.ios.infoPlist`.

---

## 🛠️ Troubleshooting

- Metro cache issues: `npx expo start -c`
- iOS Pods: `npx pod-install` (or `cd ios && pod install`)
- JDK: use **JDK 17** (`JAVA_HOME` must point to it)
- Reanimated blank screen: rebuild after fixing `babel.config.js`

---

## 📚 Helpful commands

```bash
npx expo-doctor
npx expo prebuild --clean
npx expo login
```
