import React, { forwardRef } from 'react';
import { useCameraPermissions, CameraView } from 'expo-camera';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import Animated, { useAnimatedProps } from 'react-native-reanimated';
import type { SharedValue } from 'react-native-reanimated';

const AnimatedCameraView = Animated.createAnimatedComponent(CameraView);

export interface CameraBackgroundRef {
  takePicture: () => Promise<string | null>;
}

interface CameraBackgroundProps {
  /** Reanimated shared value controlling zoom (0–1). Managed externally. */
  zoom: SharedValue<number>;
}

/**
 * Full-screen camera background.
 *
 * Zoom is controlled externally via the `zoom` SharedValue prop.
 * Both pinch gestures (index.tsx) and the slider (ScanOverlay)
 * write to the same SharedValue — this component just reads it.
 *
 * Exposes takePicture() via imperative handle.
 */
export const CameraBackground = forwardRef<CameraBackgroundRef, CameraBackgroundProps>(
  function CameraBackground({ zoom }, ref) {
    const [permission, requestPermission] = useCameraPermissions();
    const cameraRef = React.useRef<CameraView>(null);

    React.useImperativeHandle(ref, () => ({
      takePicture: async () => {
        if (!cameraRef.current) return null;
        try {
          const photo = await cameraRef.current.takePictureAsync({
            quality: 0.7,
            skipProcessing: true,
          });
          return photo?.uri ?? null;
        } catch (e) {
          console.warn('CameraBackground.takePicture failed:', e);
          return null;
        }
      },
    }));

    const animatedProps = useAnimatedProps(() => ({
      zoom: zoom.value,
    }));

    if (!permission) {
      return <View style={[StyleSheet.absoluteFill, { backgroundColor: 'black' }]} />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionText}>
            Camera access is needed to scan restaurants and products
          </Text>
          <Pressable onPress={requestPermission} style={styles.permissionButton}>
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </Pressable>
        </View>
      );
    }

    return (
      <View style={StyleSheet.absoluteFill}>
        <AnimatedCameraView
          ref={cameraRef}
          style={StyleSheet.absoluteFill}
          facing="back"
          animatedProps={animatedProps}
        />
        {/* Subtle overlay for UI contrast */}
        <View
          style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(0,0,0,0.05)' }]}
          pointerEvents="none"
        />
      </View>
    );
  }
);

const styles = StyleSheet.create({
  permissionContainer: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'black',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  permissionText: {
    color: 'white',
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 16,
    lineHeight: 22,
  },
  permissionButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
  },
  permissionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 15,
  },
});
