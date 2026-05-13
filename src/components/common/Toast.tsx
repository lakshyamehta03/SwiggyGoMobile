import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, { 
  FadeInUp, 
  FadeOutUp, 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring,
  withDelay,
  withSequence,
  runOnJS
} from 'react-native-reanimated';
import { CheckCircle2 } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import * as Haptics from 'expo-haptics';

interface ToastProps {
  message: string;
  visible: boolean;
  onHide: () => void;
  duration?: number;
}

/**
 * Premium Floating Toast Component
 * Features:
 * - Glassmorphism (BlurView)
 * - Spring-based animations
 * - Haptic feedback on appear
 * - High-contrast branding
 */
export function Toast({ message, visible, onHide, duration = 3000 }: ToastProps) {
  if (!visible) return null;

  useEffect(() => {
    if (visible) {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      const timer = setTimeout(() => {
        onHide();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [visible, duration, onHide]);

  return (
    <Animated.View 
      entering={FadeInUp.springify().damping(15).stiffness(100)}
      exiting={FadeOutUp.duration(400)}
      style={styles.container}
    >
      <BlurView intensity={80} tint="dark" style={styles.blur}>
        <View style={styles.content}>
          <CheckCircle2 size={20} color="#00D4AA" />
          <Text style={styles.text}>{message}</Text>
        </View>
      </BlurView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    zIndex: 9999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  blur: {
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    gap: 12,
  },
  text: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: -0.2,
  },
});
