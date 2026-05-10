import { CameraRefProvider } from '@/src/hooks/useCameraRef';
import { AuthProvider, useAuth } from '@/src/store/auth-store';
import { InstamartProvider } from '@/src/store/instamart-store';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import 'react-native-reanimated';
import '../global.css';

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(0, 212, 170)',
    background: 'transparent',
  },
};

/**
 * Auth-aware root navigator.
 *
 * Redirects based on auth phase:
 * - initializing   → branded splash screen
 * - unauthenticated / authenticating → (auth)/login
 * - authenticated  → (app)/index (camera flow)
 */
function RootNavigator() {
  const { state } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (state.phase === 'initializing') return;

    const inAuthGroup = segments[0] === '(auth)';
    const needsAuth = state.phase === 'unauthenticated' || state.phase === 'authenticating';

    if (needsAuth && !inAuthGroup) {
      router.replace('/(auth)/login' as any);
    } else if (state.phase === 'authenticated' && inAuthGroup) {
      router.replace('/(app)' as any);
    }
  }, [state.phase, segments]);

  // Splash screen — shown while restoring session from SecureStore
  if (state.phase === 'initializing') {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingBrand}>🔍</Text>
        <Text style={styles.loadingTitle}>SwiggyGo</Text>
        <ActivityIndicator color="#00D4AA" size="large" style={{ marginTop: 24 }} />
      </View>
    );
  }

  return (
    <ThemeProvider value={CustomTheme}>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(app)" />
      </Stack>
      <StatusBar style={state.phase === 'authenticated' ? 'light' : 'dark'} />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <AuthProvider>
        <InstamartProvider>
          <CameraRefProvider>
            <RootNavigator />
          </CameraRefProvider>
        </InstamartProvider>
      </AuthProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingBrand: {
    fontSize: 64,
    marginBottom: 8,
  },
  loadingTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.5,
  },
});
