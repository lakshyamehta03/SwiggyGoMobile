import React, { useEffect } from 'react';
import { View, Text, Pressable, ActivityIndicator, StyleSheet, Dimensions } from 'react-native';
import Animated, { 
  FadeIn, 
  FadeInDown, 
  FadeInUp, 
  FadeOutDown,
  useAnimatedStyle,
  withRepeat,
  withSequence,
  withTiming,
  useSharedValue,
  withSpring
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X, ArrowRight, ShieldCheck, Zap } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

import { useAuth } from '@/src/store/auth-store';

const { width, height } = Dimensions.get('window');

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { state, beginAuth, cancelAuth } = useAuth();
  
  const isAuthenticating = state.phase === 'authenticating';
  
  // Floating animation for brand emoji
  const floatValue = useSharedValue(0);
  useEffect(() => {
    floatValue.value = withRepeat(
      withSequence(
        withTiming(-15, { duration: 2500 }),
        withTiming(0, { duration: 2500 })
      ),
      -1,
      true
    );
  }, []);

  const animatedEmojiStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatValue.value }],
  }));

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Immersive Background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={['#0F172A', '#1E293B', '#020617']}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle glow spots */}
        <View style={[styles.glow, { top: -100, left: -100, backgroundColor: '#FC801922' }]} />
        <View style={[styles.glow, { bottom: -100, right: -100, backgroundColor: '#00D4AA22' }]} />
      </View>

      <View style={[styles.content, { paddingTop: insets.top + 40 }]}>
        {/* Entry Sequence: Brand Section */}
        <Animated.View 
          entering={FadeInDown.duration(800).springify()} 
          style={styles.brandSection}
        >
          <Animated.View style={[styles.brandIconContainer, animatedEmojiStyle]}>
            <Text style={styles.brandEmoji}>🔍</Text>
          </Animated.View>
          <Text style={styles.brandName}>SwiggyGo</Text>
          <View style={styles.badgeContainer}>
            <Zap size={12} color="#FC8019" fill="#FC8019" />
            <Text style={styles.badgeText}>SMART SCANNING</Text>
          </View>
        </Animated.View>

        <View style={styles.flexSpacer} />

        {/* Form / Polling Section */}
        {!isAuthenticating ? (
          <Animated.View 
            entering={FadeInUp.delay(400).duration(800).springify()}
            exiting={FadeOutDown}
            style={styles.cardContainer}
          >
            <BlurView intensity={20} tint="dark" style={styles.card}>
              <View style={styles.cardContent}>
                <Text style={styles.cardTitle}>Explore Your World</Text>
                <Text style={styles.cardSubtitle}>
                  Connect your Swiggy account to start identifying dishes and restaurants in real-time.
                </Text>

                <View style={styles.featureList}>
                  <FeatureItem icon={<ShieldCheck size={16} color="#00D4AA" />} text="Secure Swiggy Login" />
                  <FeatureItem icon={<Zap size={16} color="#FC8019" />} text="Instant Identification" />
                </View>

                {state.error && (
                  <Animated.View entering={FadeIn} style={styles.errorBox}>
                    <Text style={styles.errorText}>{state.error}</Text>
                  </Animated.View>
                )}

                <Pressable 
                  onPress={beginAuth} 
                  style={({ pressed }) => [
                    styles.primaryButton,
                    pressed && styles.primaryButtonPressed
                  ]}
                >
                  <Text style={styles.primaryButtonText}>Sign in with Swiggy</Text>
                  <View style={styles.buttonIcon}>
                    <ArrowRight size={18} color="#fff" strokeWidth={3} />
                  </View>
                </Pressable>

                <Text style={styles.footerText}>
                  Redirects to Swiggy secure authorization
                </Text>
              </View>
            </BlurView>
          </Animated.View>
        ) : (
          <Animated.View 
            entering={FadeInUp.duration(600)}
            exiting={FadeOutDown}
            style={styles.cardContainer}
          >
            <BlurView intensity={40} tint="dark" style={styles.card}>
              <View style={styles.pollingContent}>
                <View style={styles.loaderContainer}>
                  <ActivityIndicator color="#FC8019" size="large" />
                  <View style={styles.loaderPulse} />
                </View>
                
                <Text style={styles.pollingTitle}>Authenticating...</Text>
                <Text style={styles.pollingSubtitle}>
                  Please complete the login in the secure browser window.
                </Text>

                {/* Custom Progress Indicator */}
                <View style={styles.progressContainer}>
                  <View style={styles.progressTrack}>
                    <Animated.View 
                      style={[
                        styles.progressFill, 
                        { width: `${Math.max(5, state.pollingProgress * 100)}%` }
                      ]} 
                    />
                  </View>
                  <Text style={styles.progressText}>
                    {Math.round(state.pollingProgress * 100)}% Verified
                  </Text>
                </View>

                <Pressable onPress={cancelAuth} style={styles.cancelButton}>
                  <X size={14} color="#94A3B8" />
                  <Text style={styles.cancelText}>Cancel Attempt</Text>
                </Pressable>
              </View>
            </BlurView>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

function FeatureItem({ icon, text }: { icon: React.ReactNode, text: string }) {
  return (
    <View style={styles.featureItem}>
      {icon}
      <Text style={styles.featureText}>{text}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  glow: {
    position: 'absolute',
    width: 300,
    height: 300,
    borderRadius: 150,
    opacity: 0.6,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    paddingBottom: 40,
  },
  flexSpacer: {
    flex: 1,
  },
  
  // ─── Brand ───────────────────────────────────────────────────────
  brandSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  brandEmoji: {
    fontSize: 50,
  },
  brandName: {
    fontSize: 40,
    fontWeight: '900',
    color: '#fff',
    marginTop: 16,
    letterSpacing: -1,
  },
  badgeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(252, 128, 25, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
    marginTop: 8,
  },
  badgeText: {
    color: '#FC8019',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },

  // ─── Card ────────────────────────────────────────────────────────
  cardContainer: {
    width: '100%',
    marginBottom: 20,
  },
  card: {
    borderRadius: 32,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  cardContent: {
    padding: 32,
  },
  cardTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 15,
    color: '#94A3B8',
    lineHeight: 22,
    marginBottom: 24,
  },
  featureList: {
    gap: 12,
    marginBottom: 32,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  featureText: {
    color: '#E2E8F0',
    fontSize: 14,
    fontWeight: '500',
  },

  // ─── Button ───────────────────────────────────────────────────────
  primaryButton: {
    backgroundColor: '#FC8019',
    height: 64,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    shadowColor: '#FC8019',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  primaryButtonPressed: {
    transform: [{ scale: 0.98 }],
    opacity: 0.9,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  buttonIcon: {
    width: 32,
    height: 32,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    color: '#64748B',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 20,
  },

  // ─── Polling ─────────────────────────────────────────────────────
  pollingContent: {
    padding: 40,
    alignItems: 'center',
  },
  loaderContainer: {
    marginBottom: 24,
  },
  loaderPulse: {
    position: 'absolute',
    top: -10,
    left: -10,
    right: -10,
    bottom: -10,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#FC801933',
  },
  pollingTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  pollingSubtitle: {
    fontSize: 14,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 32,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 32,
  },
  progressTrack: {
    width: '100%',
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FC8019',
    borderRadius: 4,
  },
  progressText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  cancelText: {
    color: '#94A3B8',
    fontSize: 13,
    fontWeight: '600',
  },

  // ─── Error ───────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    marginBottom: 20,
  },
  errorText: {
    color: '#F87171',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
});
