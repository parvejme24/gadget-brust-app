# 📱 Gadget Brust — Mobile App

[![Expo SDK](https://img.shields.io/badge/Expo_SDK-58-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![React 19](https://img.shields.io/badge/React-19.3-20232a?style=for-the-badge&logo=react&logoColor=61DAFB)](https://react.dev/)
[![TanStack Query](https://img.shields.io/badge/TanStack_Query-5.104-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-2.13-764ABC?style=for-the-badge&logo=redux&logoColor=white)](https://redux-toolkit.js.org/)

---

## 📌 Short Description

**Gadget Brust Mobile App** is a cross-platform mobile shopping application built with **React Native** and **Expo SDK 58**. Engineered for fluid, 60fps mobile commerce on iOS and Android, it provides native gadget browsing, biometric-grade keychain credential security, offline-capable cart and wishlist caching, and real-time order tracking powered by the unified Gadget Brust REST API.

---

## ✨ Key Features

### 🛍️ Native Shopping & Discovery
- **Native Product Exploration:** Fluid, gesture-driven browsing with high-speed cached image grids powered by `expo-image`.
- **Search & Deep Filtering:** Instant search by model, brand, category, and price bracket with zero UI stutter.
- **Interactive Product Details:** Image carousels, specification breakdowns, stock indicators, and customer reviews.

### 🔄 Offline-Resilient Cart & Wishlist
- **Local Persistence via AsyncStorage:** Add items to your cart or bookmark gadgets to your wishlist anytime—even with spotty network connectivity.
- **Automatic Cloud Synchronization:** Guest cart and wishlist items merge seamlessly into your account upon signing in.
- **Live Quantity Controls:** Instant feedback with haptic responses (`expo-haptics`) during cart updates.

### 🔐 Secure Identity & Biometric Protection
- **Hardware-Backed Token Storage:** Authentication JWTs are stored in encrypted iOS Keychain and Android Keystore via `expo-secure-store`.
- **Silent Background Token Refresh:** Axios interceptors renew expired access tokens automatically without kicking the user to the login screen.

### 📦 Order Tracking & Account Management
- **Timeline-Based Order Tracking:** Live tracking step visualization (Order Placed ➔ Processing ➔ Shipped ➔ Delivered) using order ID and phone number.
- **Saved Delivery Addresses:** Manage multiple delivery locations for 1-tap checkout.

---

## 🛠️ Tech Stack

| Category | Technology | Description |
|---|---|---|
| **Core Framework** | React Native 0.88 & React 19 | Cross-platform native mobile foundation |
| **Tooling & Runtime** | Expo SDK 58 | Native modules, compiler toolchain, and OTA runtime |
| **Routing** | Expo Router v58 | File-based typed screen navigation with native transitions |
| **Server State** | TanStack Query v5 | Data fetching, automated caching, and stale-while-revalidate |
| **Client State** | Redux Toolkit & React-Redux | Centralized store for session, cart, and wishlist state |
| **Network Client** | Axios | Configured HTTP client with automatic silent token refresh |
| **Security Storage** | Expo Secure Store | Hardware-level secure keychain storage for JWT secrets |
| **Offline Cache** | Async Storage | Reliable key-value persistence for cart and wishlist items |
| **Motion & Gestures** | Reanimated 4 & Gesture Handler | Smooth 60fps native animations and touch gestures |
| **Images & Feedback**| Expo Image & Expo Haptics | Fast multi-layer image caching and tactile feedback |
| **Icons** | Lucide React Native | Lightweight, consistent SVG iconography |

---

## 💡 Why This Project?

While web storefronts are essential for discovery, modern consumers conduct more than 70% of online gadget research and impulse purchases on mobile devices.

Mobile web experiences often suffer from:
- Clunky navigation bars and slow page transitions on spotty cellular networks.
- Insecure or fragile credential storage in mobile browser cookies.
- Lack of tactile feedback and sluggish touch responsiveness.

**Gadget Brust Mobile App was engineered to provide a first-class, true native companion to the web platform.** It shares the identical backend business logic, inventory, and database while utilizing device-level capabilities—such as hardware-encrypted keystores, native gesture handlers, and haptic motors—for a delightful shopping experience.

---

## 🎯 Which Problems Solved?

1. **Mobile Shopping Cart Abandonment:** Delivers instantaneous navigation, smooth native checkout screens, and persistent state so users never lose their cart when switching apps.
2. **Poor Connectivity Dropouts:** Implements caching via TanStack Query and AsyncStorage so users can continue browsing products and reviewing their cart even during intermittent network drops.
3. **Fragile Mobile Authentication:** Replaces insecure local storage with `expo-secure-store`, preventing token theft on mobile devices while using silent refresh interceptors to prevent annoying re-login prompts.
4. **Heavy Image Bandwidth Usage:** Solves high cellular data usage and flickering images using `expo-image` with aggressive disk/memory caching and progressive blur-hashes.
5. **Cross-Platform Inconsistencies:** Single shared codebase delivers uniform, pixel-perfect UX across iOS and Android while respecting each platform's native navigation conventions.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js** v18+ and **npm**
- **Expo Go** app installed on your physical mobile device ([iOS App Store](https://apps.apple.com/app/expo-go/id982107779) / [Google Play Store](https://play.google.com/store/apps/details?id=host.exp.exponent)) OR an Android Studio / Xcode emulator
- Running instance of [Gadget Brust Server](https://github.com/parvejme24/gadget-brust-server) on your local network

### 1. Installation
```bash
# Clone the repository
git clone https://github.com/parvejme24/gadget-brust.git
cd gadget-brust/gadget-brust-app

# Install dependencies
npm install
```

### 2. Environment Setup
Copy the example environment file:
```bash
cp .env.example .env.local
```
Set your machine's local Wi-Fi IP address in `.env.local` (smartphones cannot resolve `localhost`):
```env
EXPO_PUBLIC_API_URL=http://<YOUR_LOCAL_IP>:6060/api/v1
```

### 3. Run the App
```bash
# Start Expo development server
npm start

# Run on Android emulator directly
npm run android

# Run on iOS simulator directly
npm run ios

# Run web browser preview
npm run web
```
Scan the displayed terminal QR code with your phone camera (iOS) or the Expo Go app (Android).

### 4. Code Quality & Diagnostics
```bash
npm run lint      # Run ESLint
npm run doctor    # Run Expo dependency and configuration audit
```

---

## 📂 Project Structure

```
src/
├── app/          # File-based navigation screens (Expo Router)
├── components/   # Reusable native UI components
├── hooks/        # TanStack Query custom data hooks
├── services/     # Modular API client endpoints
├── store/        # Redux store, slices, and hydrators
├── lib/          # Token storage, query client, formatting helpers
└── theme/        # Unified color palette, typography, and spacing
```

---

## 🏁 Conclusion

The **Gadget Brust Mobile App** delivers an uncompromising mobile shopping experience that combines native performance with seamless backend interoperability. By integrating native gestures, hardware keychain encryption, and intelligent offline state synchronization, it ensures gadget enthusiasts enjoy a swift, secure, and intuitive journey from discovery to checkout.

- 🌐 **Looking for the web client?** Check out [Gadget Brust Client](../gadget-brust-client).
- ⚙️ **Looking for the backend API?** Check out [Gadget Brust Server](../gadget-brust-server).
