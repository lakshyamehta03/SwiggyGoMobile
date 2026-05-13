<div align="center">

# SwiggyGo Mobile

**Point your camera at any grocery product — instantly find it on Instamart and add it to your cart.**

<br/>

<img src="https://img.shields.io/badge/React_Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
<img src="https://img.shields.io/badge/Expo-000020?style=for-the-badge&logo=expo&logoColor=white" />
<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white" />
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />

<br/><br/>

<img src="https://img.shields.io/badge/Platform-iOS%20%7C%20Android%20%7C%20Web-orange?style=flat-square" />
<img src="https://img.shields.io/badge/Expo_SDK-54-blue?style=flat-square" />
<img src="https://img.shields.io/badge/React_Native-0.81.5-61DAFB?style=flat-square" />
<img src="https://img.shields.io/badge/New_Architecture-Enabled-brightgreen?style=flat-square" />

</div>

---

## What It Does

SwiggyGo is a camera-first mobile app that bridges the physical and digital grocery experience. Aim your phone at a product on a shelf or at home — the app reads the label via OCR, searches Swiggy Instamart, and lets you add matching products directly to your delivery cart. No typing required.

---

## Features

- **Live Camera Scanning** — Full-screen camera with pinch-to-zoom and a smooth zoom slider
- **OCR Product Detection** — Reads product text from the camera feed (Mock → Google Cloud Vision → ML Kit migration path built-in)
- **Instamart Integration** — Searches Swiggy's grocery catalog and surfaces matching SKUs with pricing
- **Cart Management** — Add, update, and remove items; view bill breakdown with a live sticky footer
- **Swiggy OAuth** — Authenticates via Swiggy's web OAuth flow with secure JWT storage
- **Session Recovery** — Restores auth on app launch from encrypted on-device storage
- **Strategy Pattern** — Scanning modes (Instamart, Dineout) are fully pluggable — swap or add modes in one config file
- **Cross-Platform** — Runs on iOS, Android, and Web (Expo Web)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Expo](https://expo.dev) SDK 54 (New Architecture) |
| Language | TypeScript 5.9 |
| Navigation | [Expo Router](https://expo.github.io/router/) v6 (file-based) |
| UI | React Native 0.81.5 + [NativeWind](https://www.nativewind.dev/) v4 (Tailwind) |
| Animations | [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/) v4 |
| Gestures | [React Native Gesture Handler](https://docs.swmansion.com/react-native-gesture-handler/) |
| Camera | [expo-camera](https://docs.expo.dev/versions/latest/sdk/camera/) v17 |
| Secure Storage | [expo-secure-store](https://docs.expo.dev/versions/latest/sdk/securestore/) |
| Icons | [Lucide React Native](https://lucide.dev) |
| State | React Context + `useReducer` (no external state library) |
| Blur | [expo-blur](https://docs.expo.dev/versions/latest/sdk/blur/) |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        app/_layout.tsx                           │
│   GestureHandlerRootView                                         │
│   └── AuthProvider (auth phase, JWT token, session recovery)     │
│       └── InstamartProvider (addresses, cart state)              │
│           └── CameraRefProvider (shared cameraRef + zoom)        │
│               └── RootNavigator (auth-phase driven redirects)    │
└──────────────────────────┬──────────────────────────────────────┘
                           │
          ┌────────────────┴──────────────────┐
          │  (auth) group                     │  (app) group
          │  login.tsx                        │  _layout.tsx
          │  - Swiggy OAuth flow              │  - CameraBackground (always mounted)
          │  - Polling for auth status        │  - DetectionProvider (scoped)
          │  - JWT stored securely            │  │
          └───────────────────────────────────┘  │
                                                  ├── index.tsx (camera idle)
                                                  │   - Pinch zoom gesture
                                                  │   - Mode toggle
                                                  │   - useCapture() hook
                                                  │
                                                  ├── detection-results.tsx
                                                  │   - OCR results list
                                                  │   - Quick actions per result
                                                  │
                                                  ├── product/[id].tsx
                                                  │   - Product detail + add to cart
                                                  │
                                                  └── cart.tsx
                                                      - Item list + qty controls
                                                      - Bill breakdown
                                                      - Proceed to pay
```

### Detection Pipeline

```
  CameraBackground.takePicture()
         │
         ▼
  OCRServiceFactory.create('mock' | 'google-cloud-vision' | 'mlkit')
         │
         ▼  OCRResponse { fullText, detections[] }
         │
         ▼
  IDetectionStrategy.process(ocrResponse, { addressId })
         │  ┌─────────────────────────────────────────┐
         │  │  InstamartDetectionStrategy              │
         │  │  - clean fullText → search query         │
         │  │  - instamartService.search(query, addr)  │
         │  │  - map products → ProcessedResult[]      │
         │  └─────────────────────────────────────────┘
         │
         ▼  ProcessedResult[]
         │
         ▼
  DetectionStore.setResults()  →  navigate to /detection-results
```

### Service Layer

```
  instamart-client.ts   — raw fetch, throws InstamartApiError (with statusCode)
         │
  instamart-service.ts  — business logic, response flattening
         │
  instamart-store.tsx   — React state, wrapApiCall catches 401 → invalidateSession()
```

---

## Project Structure

```
SwiggyGoMobile/
├── app/
│   ├── _layout.tsx              # Root: providers + auth gate
│   ├── (auth)/
│   │   └── login.tsx            # Swiggy OAuth screen
│   └── (app)/
│       ├── _layout.tsx          # App shell: CameraBackground + DetectionProvider
│       ├── index.tsx            # Camera idle screen
│       ├── detection-results.tsx
│       ├── cart.tsx
│       └── product/[id].tsx
│
├── src/
│   ├── components/
│   │   ├── feature/             # Domain-specific components
│   │   │   ├── CameraBackground.tsx
│   │   │   ├── ScanOverlay.tsx  # Zoom slider + scan frame
│   │   │   ├── TopBar.tsx
│   │   │   └── BottomDock.tsx   # Shutter + cart button
│   │   ├── common/
│   │   │   └── Toast.tsx
│   │   └── ui/                  # Generic primitives (Button, Card, Text)
│   │
│   ├── config/
│   │   ├── api-config.ts        # Base URL, endpoints, polling config
│   │   └── detection-config.ts  # Mode registry (add new modes here)
│   │
│   ├── hooks/
│   │   ├── useCameraRef.tsx     # Shared camera ref + zoom SharedValue
│   │   └── useCapture.ts        # Capture orchestration hook
│   │
│   ├── services/
│   │   ├── auth/                # OAuth flow, session polling, secure storage
│   │   ├── detection/           # IDetectionStrategy + Instamart/Dineout strategies
│   │   ├── instamart/           # Client → Service three-tier
│   │   └── ocr/                 # OCRServiceFactory + Mock/GCV/MLKit impls
│   │
│   ├── store/
│   │   ├── auth-store.tsx       # AuthPhase state machine
│   │   ├── detection-store.tsx  # OCR + ProcessedResult state
│   │   └── instamart-store.tsx  # Addresses + cart state
│   │
│   ├── types/
│   │   └── detection.ts         # ScanningMode, ProcessedResult, ModeDisplayConfig
│   │
│   └── tw/
│       └── index.tsx            # NativeWind primitives re-export
│
└── assets/
    └── images/                  # Icons, splash, adaptive icon layers
```

---

## Prerequisites

- [Node.js](https://nodejs.org) 18+
- [Expo Go](https://expo.dev/client) on a physical device, or iOS Simulator (Xcode) / Android Emulator
- A running instance of the SwiggyGo backend API

---

## Installation

```bash
# Clone the repo
git clone https://github.com/your-username/SwiggyGoMobile.git
cd SwiggyGoMobile

# Install dependencies
npm install
```

### Environment Setup

Create a `.env` file in the project root:

```bash
# Simulator / Web (localhost reachable)
EXPO_PUBLIC_API_URL=http://localhost:3000

# Physical device via Expo Go (cannot reach localhost)
EXPO_PUBLIC_API_URL=http://192.168.x.x:3000
```

> Expo automatically injects `EXPO_PUBLIC_*` variables at build time. All API config lives in `src/config/api-config.ts`.

---

## Running the App

```bash
# Start development server (Expo Go compatible)
npx expo start

# iOS Simulator
npx expo start --ios

# Android Emulator
npx expo start --android

# Web
npx expo start --web

# Lint
npx expo lint
```

---

## OCR Migration Path

The app ships with a mock OCR service and is architected to swap implementations without touching any calling code:

| Phase | Implementation | How to Enable |
|---|---|---|
| **Phase 1 (current)** | `MockOCRService` — returns realistic fixture data | `'mock'` |
| **Phase 2** | Google Cloud Vision REST API — works in Expo Go | `'google-cloud-vision'` |
| **Phase 3** | ML Kit on-device — fastest, offline-capable | `'mlkit'` — requires `npx expo run:ios` |

Change the factory argument in `src/hooks/useCapture.ts` to switch implementations.

---

## Adding a New Scanning Mode

1. Create a strategy in `src/services/detection/strategies/YourStrategy.ts` implementing `IDetectionStrategy`
2. Register it in `src/config/detection-config.ts`:

   ```ts
   export const DETECTION_STRATEGIES: Record<ScanningMode, IDetectionStrategy> = {
     [ScanningMode.INSTAMART]: new InstamartDetectionStrategy(),
     [ScanningMode.YOUR_MODE]: new YourStrategy(),
   };
   ```

3. Add the mode to `ENABLED_MODES` in the same file — the UI picks it up automatically.

---

## Key Identifiers

| Identifier | Description |
|---|---|
| `spinId` | Instamart product variation ID — used for all cart operations |
| `addressId` | Required for search and cart; fetched on auth from `instamartService.fetchAddresses()` |
| `backendToken` | JWT stored in `expo-secure-store`, sent as `Authorization: Bearer <token>` |

---

## 401 Handling

All authenticated API calls flow through one of two paths:

- **Store operations** (cart, addresses) — `wrapApiCall` in `instamart-store.tsx` catches `statusCode === 401` and calls `invalidateSession()` automatically.
- **Detection flow** — `useCapture.ts` catches `statusCode === 401` from `IDetectionStrategy.process()` and calls `invalidateSession()`.

Both redirect to login. Mirror this pattern for any new authenticated services.

---

## License

Private — all rights reserved.
