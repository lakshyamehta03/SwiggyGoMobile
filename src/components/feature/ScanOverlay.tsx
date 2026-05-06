import React, { useEffect } from 'react';
import { View, Text, useWindowDimensions, StyleSheet } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
  runOnJS,
} from 'react-native-reanimated';
import { Gesture, GestureDetector } from 'react-native-gesture-handler';
import type { SharedValue } from 'react-native-reanimated';

const CORNER_SIZE = 28;
const CORNER_THICKNESS = 3;
const ACCENT = '#00D4AA';
const ZOOM_MAX = 0.5;

// Slider dimensions
const SLIDER_WIDTH_RATIO = 0.55; // 55% of screen width
const SLIDER_HEIGHT = 24;
const SLIDER_TRACK_HEIGHT = 3;
const SLIDER_THUMB_SIZE = 18;

interface ScanOverlayProps {
  /** Whether the scanner is actively processing */
  isScanning?: boolean;
  /** Shared zoom value (0–ZOOM_MAX) synced with pinch + camera */
  zoom: SharedValue<number>;
}

/**
 * Camera scan overlay with:
 * - Corner bracket markers
 * - Semi-transparent dark mask outside scan region
 * - Animated scanning line
 * - Horizontal zoom slider above the scan box
 *
 * The slider writes to the same SharedValue that pinch gestures use,
 * keeping everything in sync.
 */
export function ScanOverlay({ isScanning = false, zoom }: ScanOverlayProps) {
  const { width: screenWidth, height: screenHeight } = useWindowDimensions();

  // Scan box dimensions — responsive
  const boxWidth = screenWidth * 0.75;
  const boxHeight = screenHeight * 0.18;
  const boxLeft = (screenWidth - boxWidth) / 2;
  const boxTop = (screenHeight - boxHeight) / 2 - 40;

  // Slider dimensions
  const sliderWidth = screenWidth * SLIDER_WIDTH_RATIO;
  const sliderLeft = (screenWidth - sliderWidth) / 2;
  const sliderTop = boxTop - 48;

  // Scanning line animation
  const scanLineY = useSharedValue(0);
  const cornerOpacity = useSharedValue(1);

  useEffect(() => {
    scanLineY.value = withRepeat(
      withSequence(
        withTiming(boxHeight - 2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        withTiming(0, { duration: 2000, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      false
    );
    cornerOpacity.value = withRepeat(
      withSequence(
        withTiming(0.5, { duration: 1200 }),
        withTiming(1, { duration: 1200 })
      ),
      -1,
      false
    );
  }, [boxHeight]);

  const scanLineStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: scanLineY.value }],
    opacity: isScanning ? 1 : 0.6,
  }));

  const cornerPulseStyle = useAnimatedStyle(() => ({
    opacity: cornerOpacity.value,
  }));

  // ─── Zoom Slider ───────────────────────────────────────────────

  // Thumb position tracks zoom value
  const thumbStyle = useAnimatedStyle(() => {
    const progress = zoom.value / ZOOM_MAX;
    const trackUsable = sliderWidth - SLIDER_THUMB_SIZE;
    return {
      transform: [{ translateX: progress * trackUsable }],
    };
  });

  // Active track fill
  const fillStyle = useAnimatedStyle(() => {
    const progress = zoom.value / ZOOM_MAX;
    return {
      width: `${progress * 100}%`,
    };
  });

  // Zoom label
  const zoomLabelStyle = useAnimatedStyle(() => {
    const pct = Math.round((zoom.value / ZOOM_MAX) * 100);
    return {
      opacity: zoom.value > 0.01 ? 1 : 0.5,
    };
  });

  // Slider pan gesture
  const sliderGesture = Gesture.Pan()
    .onUpdate((e) => {
      'worklet';
      const trackUsable = sliderWidth - SLIDER_THUMB_SIZE;
      // e.x is relative to the GestureDetector container
      const raw = (e.x - SLIDER_THUMB_SIZE / 2) / trackUsable;
      const clamped = Math.max(0, Math.min(1, raw));
      zoom.value = clamped * ZOOM_MAX;
    })
    .hitSlop({ top: 12, bottom: 12, left: 8, right: 8 });

  // Slider tap gesture — jump to tapped position
  const sliderTap = Gesture.Tap()
    .onEnd((e) => {
      'worklet';
      const trackUsable = sliderWidth - SLIDER_THUMB_SIZE;
      const raw = (e.x - SLIDER_THUMB_SIZE / 2) / trackUsable;
      const clamped = Math.max(0, Math.min(1, raw));
      zoom.value = withTiming(clamped * ZOOM_MAX, { duration: 200 });
    });

  const sliderComposed = Gesture.Race(sliderGesture, sliderTap);

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="box-none">
      {/* Dark mask — top */}
      <View style={[styles.mask, { top: 0, left: 0, right: 0, height: boxTop }]} pointerEvents="none" />
      {/* Dark mask — bottom */}
      <View
        style={[styles.mask, { top: boxTop + boxHeight, left: 0, right: 0, bottom: 0 }]}
        pointerEvents="none"
      />
      {/* Dark mask — left */}
      <View
        style={[styles.mask, { top: boxTop, left: 0, width: boxLeft, height: boxHeight }]}
        pointerEvents="none"
      />
      {/* Dark mask — right */}
      <View
        style={[styles.mask, { top: boxTop, right: 0, width: boxLeft, height: boxHeight }]}
        pointerEvents="none"
      />

      {/* ─── Zoom Slider ─── */}
      <View
        style={{
          position: 'absolute',
          top: sliderTop,
          left: sliderLeft,
          width: sliderWidth,
          height: SLIDER_HEIGHT,
          justifyContent: 'center',
        }}
      >
        {/* Labels */}
        <View style={styles.sliderLabels}>
          <Text style={styles.sliderLabel}>1×</Text>
          <Animated.Text style={[styles.sliderLabel, zoomLabelStyle]}>
            Zoom
          </Animated.Text>
          <Text style={styles.sliderLabel}>5×</Text>
        </View>

        {/* Track + Thumb */}
        <GestureDetector gesture={sliderComposed}>
          <Animated.View style={styles.sliderTrackContainer}>
            {/* Background track */}
            <View style={styles.sliderTrack}>
              {/* Active fill */}
              <Animated.View style={[styles.sliderFill, fillStyle]} />
            </View>
            {/* Thumb */}
            <Animated.View style={[styles.sliderThumb, thumbStyle]} />
          </Animated.View>
        </GestureDetector>
      </View>

      {/* ─── Scan Box ─── */}
      <View
        style={{
          position: 'absolute',
          top: boxTop,
          left: boxLeft,
          width: boxWidth,
          height: boxHeight,
        }}
        pointerEvents="none"
      >
        {/* Corner brackets */}
        <Animated.View style={cornerPulseStyle}>
          <View style={[styles.corner, styles.cornerTL]} />
          <View style={[styles.corner, styles.cornerTL, styles.cornerH]} />
          <View style={[styles.corner, styles.cornerTR]} />
          <View style={[styles.corner, styles.cornerTR, styles.cornerH]} />
          <View style={[styles.corner, styles.cornerBL]} />
          <View style={[styles.corner, styles.cornerBL, styles.cornerH]} />
          <View style={[styles.corner, styles.cornerBR]} />
          <View style={[styles.corner, styles.cornerBR, styles.cornerH]} />
        </Animated.View>

        {/* Scanning line */}
        <Animated.View style={[styles.scanLine, scanLineStyle]} />
      </View>

      {/* Instruction text */}
      <View
        style={{
          position: 'absolute',
          top: boxTop + boxHeight + 20,
          left: 0,
          right: 0,
          alignItems: 'center',
        }}
        pointerEvents="none"
      >
        <Text style={styles.instructionText}>
          {isScanning ? 'Scanning...' : 'Position text within the frame'}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mask: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.50)',
  },

  // ─── Slider ──────────────────────────────────────────────────────
  sliderLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  sliderLabel: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 10,
    fontWeight: '600',
    fontVariant: ['tabular-nums'],
  },
  sliderTrackContainer: {
    width: '100%',
    height: SLIDER_HEIGHT,
    justifyContent: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: SLIDER_TRACK_HEIGHT,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
    overflow: 'hidden',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: ACCENT,
    borderRadius: SLIDER_TRACK_HEIGHT / 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: SLIDER_THUMB_SIZE,
    height: SLIDER_THUMB_SIZE,
    borderRadius: SLIDER_THUMB_SIZE / 2,
    backgroundColor: '#ffffff',
    borderWidth: 2,
    borderColor: ACCENT,
    // Center vertically on the track
    top: (SLIDER_HEIGHT - SLIDER_THUMB_SIZE) / 2,
    boxShadow: '0 1px 4px rgba(0,0,0,0.3)',
  },

  // ─── Corners ─────────────────────────────────────────────────────
  corner: {
    position: 'absolute',
    width: CORNER_THICKNESS,
    height: CORNER_SIZE,
    backgroundColor: ACCENT,
    borderRadius: CORNER_THICKNESS / 2,
  },
  cornerH: {
    width: CORNER_SIZE,
    height: CORNER_THICKNESS,
  },
  cornerTL: { top: 0, left: 0 },
  cornerTR: { top: 0, right: 0 },
  cornerBL: { bottom: 0, left: 0 },
  cornerBR: { bottom: 0, right: 0 },

  // ─── Scan Line ───────────────────────────────────────────────────
  scanLine: {
    position: 'absolute',
    left: 8,
    right: 8,
    height: 2,
    backgroundColor: ACCENT,
    borderRadius: 1,
    top: 0,
  },

  // ─── Text ────────────────────────────────────────────────────────
  instructionText: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    letterSpacing: 0.3,
  },
});
