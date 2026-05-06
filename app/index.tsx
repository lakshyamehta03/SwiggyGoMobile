import { useState, useCallback } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeOutDown, useSharedValue } from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import { X } from 'lucide-react-native';
import { router } from 'expo-router';

import { TopBar } from '@/src/components/feature/TopBar';
import { BottomDock } from '@/src/components/feature/BottomDock';
import { ScanOverlay } from '@/src/components/feature/ScanOverlay';
import { useDetection } from '@/src/store/detection-store';
import { OCRServiceFactory } from '@/src/services/ocr';
import { useCameraRef, useCameraZoom } from '@/src/hooks/useCameraRef';

const ZOOM_MAX = 0.5;

export default function CameraIdleScreen() {
  const [mode, setMode] = useState<'dineout' | 'instamart'>('dineout');
  const [showHint, setShowHint] = useState(true);
  const { state, setProcessing, setResults, setError } = useDetection();
  const cameraRef = useCameraRef();
  const zoom = useCameraZoom();

  // Pinch-to-zoom: save the zoom level at gesture start,
  // then scale relative to that base
  const pinchBase = useSharedValue(0);

  const pinchGesture = Gesture.Pinch()
    .onStart(() => {
      'worklet';
      pinchBase.value = zoom.value;
    })
    .onUpdate((e) => {
      'worklet';
      // scale > 1 = zoom in, < 1 = zoom out
      // Map scale 1–3 to 0–ZOOM_MAX range from the base
      const delta = (e.scale - 1) * ZOOM_MAX * 0.6;
      const newZoom = pinchBase.value + delta;
      zoom.value = Math.max(0, Math.min(ZOOM_MAX, newZoom));
    });

  const handleCapture = useCallback(async () => {
    if (state.isProcessing) return;

    setProcessing(true);

    try {
      const imageUri = await cameraRef.current?.takePicture();
      const uri = imageUri ?? `mock://capture_${Date.now()}`;

      const ocrService = OCRServiceFactory.create('mock');
      const response = await ocrService.recognizeText({ imageUri: uri });

      setResults(response);

      if (response.success && response.detections.length > 0) {
        router.push('/detection-results' as any);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'OCR failed');
    }
  }, [state.isProcessing, cameraRef, setProcessing, setResults, setError]);

  return (
    <GestureDetector gesture={pinchGesture}>
      <View style={{ flex: 1 }}>
        {/* Scan overlay with zoom slider */}
        <ScanOverlay isScanning={state.isProcessing} zoom={zoom} />

        {/* Top bar */}
        <TopBar
          mode={mode}
          onModeToggle={() => setMode((prev) => (prev === 'dineout' ? 'instamart' : 'dineout'))}
        />

        {/* Dismissible hint popup */}
        {showHint && (
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOutDown.duration(300)}
            style={styles.hintContainer}
          >
            <View style={styles.hintBox}>
              <Pressable onPress={() => setShowHint(false)} style={styles.hintClose} hitSlop={8}>
                <X size={14} color="#ffffff" />
              </Pressable>
              <Text style={styles.hintTitle}>Point at a restaurant or product</Text>
              <Text style={styles.hintSubtitle}>Works best in good lighting</Text>
            </View>
          </Animated.View>
        )}

        {/* Processing indicator */}
        {state.isProcessing && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOutDown.duration(200)}
            style={styles.processingContainer}
          >
            <View style={styles.processingPill}>
              <ActivityIndicator color="#00D4AA" size="small" />
              <Text style={styles.processingText}>Scanning...</Text>
            </View>
          </Animated.View>
        )}

        {/* Error toast */}
        {state.error != null && !state.isProcessing && (
          <Animated.View
            entering={FadeIn.duration(200)}
            exiting={FadeOutDown.duration(300)}
            style={styles.errorContainer}
          >
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>{state.error}</Text>
            </View>
          </Animated.View>
        )}

        {/* Bottom dock */}
        <BottomDock onCameraClick={handleCapture} />
      </View>
    </GestureDetector>
  );
}

const styles = StyleSheet.create({
  hintContainer: {
    position: 'absolute',
    top: '40%',
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  hintBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 16,
    paddingHorizontal: 24,
    paddingVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  hintClose: {
    position: 'absolute',
    top: 10,
    right: 10,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  hintTitle: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
    marginBottom: 6,
    marginTop: 4,
  },
  hintSubtitle: {
    color: 'rgba(255, 255, 255, 0.55)',
    fontSize: 13,
    textAlign: 'center',
  },
  processingContainer: {
    position: 'absolute',
    bottom: 160,
    left: 0,
    right: 0,
    alignItems: 'center',
  },
  processingPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 999,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  processingText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  errorContainer: {
    position: 'absolute',
    bottom: 160,
    left: 24,
    right: 24,
    alignItems: 'center',
  },
  errorBox: {
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  errorText: {
    color: '#ff6b6b',
    fontSize: 14,
    textAlign: 'center',
  },
});
