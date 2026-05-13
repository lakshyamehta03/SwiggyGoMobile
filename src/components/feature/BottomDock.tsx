import { View, Pressable, StyleSheet } from 'react-native';
import { Camera, Image as ImageIcon, Clock } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface BottomDockProps {
  onCameraClick?: () => void;
}

/**
 * BottomDock with truly circular buttons.
 *
 * Uses solid rgba backgrounds instead of BlurView to fix the
 * rectangular clipping artifact on Android. borderCurve: continuous
 * for smooth iOS corners per skills.
 */
export function BottomDock({ onCameraClick }: BottomDockProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { paddingBottom: Math.max(insets.bottom + 12, 28) },
      ]}
    >
      {/* Gallery */}
      <Pressable style={styles.sideButton}>
        <ImageIcon size={22} color="#ffffff" />
      </Pressable>

      {/* Main capture button */}
      <Pressable onPress={onCameraClick} style={styles.captureButton}>
        <View style={styles.captureInner}>
          <Camera size={30} color="#1f2937" />
        </View>
      </Pressable>

      {/* History */}
      <Pressable style={styles.sideButton}>
        <Clock size={22} color="#ffffff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 28,
    paddingHorizontal: 16,
  },
  sideButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  captureButton: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderCurve: 'continuous',
    overflow: 'hidden',
  },
  captureInner: {
    width: 62,
    height: 62,
    borderRadius: 31,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
});
