import { Stack, usePathname } from 'expo-router';
import { View } from 'react-native';
import { CameraBackground } from '@/src/components/feature/CameraBackground';
import { useCameraContext } from '@/src/hooks/useCameraRef';
import { DetectionProvider } from '@/src/store/detection-store';

/**
 * App group layout — main authenticated experience.
 *
 * Camera background lives here (only rendered when authenticated).
 * Detection state is scoped to the app group.
 */
export default function AppLayout() {
  const { cameraRef, zoom } = useCameraContext();

  return (
    <DetectionProvider>
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
    </DetectionProvider>
  );
}
