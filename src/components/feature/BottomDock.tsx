import { View, Pressable } from '@/src/tw';
import { Camera, Image as ImageIcon, Clock } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NativeWind v4: register BlurView for className support
cssInterop(BlurView, { className: 'style' });

interface BottomDockProps {
  onCameraClick?: () => void;
}

export function BottomDock({ onCameraClick }: BottomDockProps) {
  const insets = useSafeAreaInsets();

  return (
    <View 
      className="absolute bottom-0 left-0 right-0 z-50 flex-row items-center justify-center gap-8 px-4"
      style={{ paddingBottom: Math.max(insets.bottom + 16, 32) }}
    >
      <Pressable className="w-14 h-14 rounded-full overflow-hidden shadow-lg">
        <BlurView intensity={60} tint="light" className="flex-1 items-center justify-center border border-white/60 bg-white/40">
          <ImageIcon size={24} color="#1f2937" />
        </BlurView>
      </Pressable>

      <Pressable
        onPress={onCameraClick}
        className="w-20 h-20 rounded-full flex items-center justify-center bg-white border-[4px] border-white/60 shadow-2xl active:scale-95"
      >
        <Camera size={36} color="#1f2937" />
      </Pressable>

      <Pressable className="w-14 h-14 rounded-full overflow-hidden shadow-lg">
        <BlurView intensity={60} tint="light" className="flex-1 items-center justify-center border border-white/60 bg-white/40">
          <Clock size={24} color="#1f2937" />
        </BlurView>
      </Pressable>
    </View>
  );
}
