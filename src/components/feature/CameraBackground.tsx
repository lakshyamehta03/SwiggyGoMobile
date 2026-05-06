import { useCameraPermissions, CameraView } from 'expo-camera';
import { View, Text, Pressable } from '@/src/tw';
import { StyleSheet, Platform } from 'react-native';

export function CameraBackground() {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return <View className="absolute inset-0 bg-black" />;
  }

  if (!permission.granted) {
    return (
      <View className="absolute inset-0 bg-black items-center justify-center p-6">
        <Text className="text-white text-center mb-4 text-lg">
          We need your permission to show the camera
        </Text>
        <Pressable
          onPress={requestPermission}
          className="bg-primary px-6 py-3 rounded-full"
        >
          <Text className="text-white font-semibold">Grant Permission</Text>
        </Pressable>
      </View>
    );
  }

  // Fallback to black on web for now if expo-camera web support is flaky,
  // but expo-camera does support web!
  return (
    <View className="absolute inset-0 bg-black">
      <CameraView style={StyleSheet.absoluteFillObject} facing="back" />
      {/* Light overlay for camera effect, similar to web */}
      <View className="absolute inset-0 bg-white/10" pointerEvents="none" />
    </View>
  );
}
