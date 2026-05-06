import '../global.css';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { CameraBackground } from '@/src/components/feature/CameraBackground';
import { CameraRefProvider, useCameraContext } from '@/src/hooks/useCameraRef';
import { DetectionProvider } from '@/src/store/detection-store';

export const unstable_settings = {
  anchor: 'index',
};

const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(0, 212, 170)',
    background: 'transparent',
  },
};

function RootLayoutInner() {
  const { cameraRef, zoom } = useCameraContext();

  return (
    <ThemeProvider value={CustomTheme}>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraBackground ref={cameraRef} zoom={zoom} />

        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen
            name="product/[id]"
            options={{ presentation: 'formSheet' }}
          />
          <Stack.Screen
            name="restaurant/[id]"
            options={{ presentation: 'formSheet' }}
          />
          <Stack.Screen
            name="detection-results"
            options={{
              presentation: 'formSheet',
              sheetGrabberVisible: true,
              sheetAllowedDetents: [0.25, 0.55, 1.0],
              sheetLargestUndimmedDetentIndex: 1,
              headerShown: false,
              contentStyle: { backgroundColor: 'white' },
            }}
          />
        </Stack>
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <CameraRefProvider>
        <DetectionProvider>
          <RootLayoutInner />
        </DetectionProvider>
      </CameraRefProvider>
    </GestureHandlerRootView>
  );
}
