import { View, Text, Pressable, ActivityIndicator, StyleSheet } from 'react-native';
import Animated, { FadeIn, FadeInUp, FadeOutDown } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { X } from 'lucide-react-native';

import { useAuth } from '@/src/store/auth-store';

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const { state, beginAuth, cancelAuth } = useAuth();

  const isAuthenticating = state.phase === 'authenticating';

  return (
    <View style={[styles.container, { paddingTop: insets.top + 20 }]}>
      <StatusBar style="dark" />

      <View style={styles.content}>
        {/* Brand */}
        <Animated.View entering={FadeIn.duration(600)} style={styles.brandSection}>
          <Text style={styles.brandEmoji}>🔍</Text>
          <Text style={styles.brandName}>SwiggyGo</Text>
          <Text style={styles.brandSubtitle}>
            Point your camera at restaurants{'\n'}and products to explore
          </Text>
        </Animated.View>

        {/* Auth states */}
        {!isAuthenticating && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            exiting={FadeOutDown.duration(300)}
            style={styles.formSection}
          >
            <Text style={styles.formTitle}>Get started</Text>
            <Text style={styles.formSubtitle}>
              Sign in with your Swiggy account to unlock camera scanning, restaurant discovery, and more.
            </Text>

            {/* Error from previous attempt */}
            {state.error && (
              <Animated.View entering={FadeIn.duration(200)} style={styles.errorBox}>
                <Text style={styles.errorText}>{state.error}</Text>
              </Animated.View>
            )}

            {/* Login button */}
            <Pressable onPress={beginAuth} style={styles.primaryButton}>
              <Text style={styles.primaryButtonEmoji}>🟠</Text>
              <Text style={styles.primaryButtonText}>Login with Swiggy</Text>
            </Pressable>

            <Text style={styles.termsText}>
              You'll be redirected to Swiggy's secure login page.{'\n'}
              We never see your Swiggy password.
            </Text>
          </Animated.View>
        )}

        {/* Authenticating / Polling state */}
        {isAuthenticating && (
          <Animated.View
            entering={FadeInUp.duration(400)}
            exiting={FadeOutDown.duration(300)}
            style={styles.formSection}
          >
            <View style={styles.pollingSection}>
              <ActivityIndicator color="#00D4AA" size="large" />

              <Text style={styles.pollingTitle}>Waiting for login...</Text>
              <Text style={styles.pollingSubtitle}>
                Complete the sign-in on the Swiggy page that opened in your browser.
              </Text>

              {/* Progress indicator */}
              {state.pollingProgress > 0 && (
                <View style={styles.progressTrack}>
                  <Animated.View
                    style={[
                      styles.progressFill,
                      { width: `${Math.min(state.pollingProgress * 100, 100)}%` },
                    ]}
                  />
                </View>
              )}

              {/* Cancel */}
              <Pressable onPress={cancelAuth} style={styles.cancelButton}>
                <X size={16} color="#6b7280" />
                <Text style={styles.cancelText}>Cancel</Text>
              </Pressable>
            </View>
          </Animated.View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
  },

  // ─── Brand ───────────────────────────────────────────────────────
  brandSection: {
    alignItems: 'center',
    paddingTop: 48,
    paddingBottom: 40,
  },
  brandEmoji: {
    fontSize: 56,
    marginBottom: 12,
  },
  brandName: {
    fontSize: 32,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginTop: 8,
  },

  // ─── Form ────────────────────────────────────────────────────────
  formSection: {
    gap: 16,
  },
  formTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#111827',
    letterSpacing: -0.3,
  },
  formSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 21,
  },

  // ─── Error ───────────────────────────────────────────────────────
  errorBox: {
    backgroundColor: '#fef2f2',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    borderCurve: 'continuous',
  },
  errorText: {
    fontSize: 13,
    color: '#dc2626',
    textAlign: 'center',
    lineHeight: 18,
  },

  // ─── Primary Button ──────────────────────────────────────────────
  primaryButton: {
    height: 56,
    borderRadius: 16,
    backgroundColor: '#FC8019',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
    borderCurve: 'continuous',
    boxShadow: '0 4px 12px rgba(252, 128, 25, 0.35)',
  },
  primaryButtonEmoji: {
    fontSize: 18,
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  // ─── Terms ───────────────────────────────────────────────────────
  termsText: {
    fontSize: 12,
    color: '#9ca3af',
    textAlign: 'center',
    lineHeight: 18,
    marginTop: 4,
  },

  // ─── Polling ─────────────────────────────────────────────────────
  pollingSection: {
    alignItems: 'center',
    gap: 16,
    paddingTop: 24,
  },
  pollingTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginTop: 8,
  },
  pollingSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 21,
  },
  progressTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#e5e7eb',
    borderRadius: 2,
    overflow: 'hidden',
    marginTop: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#00D4AA',
    borderRadius: 2,
  },
  cancelButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: '#f3f4f6',
    marginTop: 8,
  },
  cancelText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#6b7280',
  },
});
