import { View, Text } from '@/src/tw';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
import { TopBar } from '@/src/components/feature/TopBar';
import { BottomDock } from '@/src/components/feature/BottomDock';
import { useState } from 'react';
import { router } from 'expo-router';

// NativeWind v4: register BlurView for className support
cssInterop(BlurView, { className: 'style' });

export default function CameraIdleScreen() {
  const [mode, setMode] = useState<'dineout' | 'instamart'>('dineout');

  return (
    <View className="flex-1 w-full h-full relative">
      <TopBar 
        mode={mode} 
        onModeToggle={() => setMode(prev => prev === 'dineout' ? 'instamart' : 'dineout')} 
      />
      
      <View className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <BlurView
          intensity={60}
          tint="light"
          className="rounded-3xl px-8 py-6 border border-white/60 shadow-xl"
        >
          <Text className="text-gray-800 text-lg mb-2 font-medium text-center">
            Point at a restaurant or product
          </Text>
          <Text className="text-gray-600 text-sm text-center">
            Works best in good lighting
          </Text>
        </BlurView>
      </View>

      <BottomDock 
        onCameraClick={() => {
          // Temporarily mock clicking the camera to go to product details
          // In a real flow, this would run inference on the frame
          router.push('/product/1');
        }}
      />
    </View>
  );
}
