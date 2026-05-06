import React, { createContext, useRef } from 'react';
import { useSharedValue, type SharedValue } from 'react-native-reanimated';
import type { CameraBackgroundRef } from '@/src/components/feature/CameraBackground';

/**
 * Shared camera context.
 *
 * Provides:
 * - cameraRef: imperative handle for takePicture()
 * - zoom: Reanimated SharedValue<number> synchronized between
 *   pinch gestures (index.tsx), zoom slider (ScanOverlay), and CameraView (_layout)
 *
 * Using a single SharedValue ensures pinch, slider, and camera
 * always agree on zoom level without extra state sync.
 */
interface CameraContextValue {
  cameraRef: React.RefObject<CameraBackgroundRef | null>;
  zoom: SharedValue<number>;
}

const CameraRefContext = createContext<CameraContextValue>({
  cameraRef: { current: null },
  zoom: { value: 0 } as SharedValue<number>,
});

export function CameraRefProvider({ children }: { children: React.ReactNode }) {
  const cameraRef = useRef<CameraBackgroundRef>(null);
  const zoom = useSharedValue(0);

  return (
    <CameraRefContext.Provider value={{ cameraRef, zoom }}>
      {children}
    </CameraRefContext.Provider>
  );
}

export function useCameraRef() {
  const { cameraRef } = React.useContext(CameraRefContext);
  return cameraRef;
}

export function useCameraZoom() {
  const { zoom } = React.useContext(CameraRefContext);
  return zoom;
}

export function useCameraContext() {
  return React.useContext(CameraRefContext);
}
