# Gadget Brust — mobile app

React Native app (Expo SDK 58, Expo Router) for the Gadget Brust store. It uses the same API as the web app (`gadget-brust-server`).

## Stack

- **Expo + Expo Router**: file-based screens in `src/app/`
- **TanStack Query**: server data (products, categories, store settings…)
- **Redux Toolkit**: client state (session, cart, wishlist)
- **axios**: one API client with token refresh (`src/lib/api.js`)
- **expo-secure-store**: login tokens in the device keychain; **AsyncStorage**: cart and wishlist
- **Reanimated + Gesture Handler**: animations; **expo-image**: fast images; **lucide-react-native**: icons

## Run it

1. Start the backend (`gadget-brust-server`, `npm run start`, port 6060).
2. Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL` to your computer's Wi-Fi IP (a phone can't reach `localhost`).
3. Install **Expo Go** on your phone (same Wi-Fi as the computer).
4. `npm start`, then scan the QR code with the camera (iOS) or Expo Go (Android).

`npm run web` opens a browser preview (the backend must allow that origin in CORS).

## Folders

```
src/
  app/          screens (Expo Router)
  components/   reusable UI
  hooks/        TanStack Query hooks
  services/     API calls
  store/        Redux Toolkit store, slices, hydrator
  lib/          api client, query client, token storage, config, format helpers
  theme/        colours, spacing, radius, font sizes (match the web brand)
```

## Checks

```bash
npx eslint src      # lint
npx expo-doctor     # dependency/config health
```
