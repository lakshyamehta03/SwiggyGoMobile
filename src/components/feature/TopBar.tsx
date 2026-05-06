import { View, Text, Pressable } from '@/src/tw';
import { Menu, Zap, Settings } from 'lucide-react-native';
import { BlurView } from 'expo-blur';
import { cssInterop } from 'nativewind';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

// NativeWind v4: register BlurView for className support
cssInterop(BlurView, { className: 'style' });

interface TopBarProps {
  mode: 'dineout' | 'instamart';
  onModeToggle: () => void;
}

export function TopBar({ mode, onModeToggle }: TopBarProps) {
  const insets = useSafeAreaInsets();
  
  return (
    <View 
      className="absolute left-4 right-4 z-50 flex-row items-center justify-between"
      style={{ top: insets.top + 16 }}
    >
      <Pressable className="w-10 h-10 rounded-full overflow-hidden">
        <BlurView intensity={60} tint="light" className="flex-1 items-center justify-center border border-white/60 bg-white/40">
          <Menu size={20} color="#1f2937" />
        </BlurView>
      </Pressable>

      <Pressable
        onPress={onModeToggle}
        className="rounded-full overflow-hidden"
      >
        <BlurView intensity={60} tint="light" className="px-6 py-2.5 flex-row items-center gap-3 border border-white/60 bg-white/40">
          <Text className={`text-gray-800 ${mode === 'dineout' ? 'opacity-100 font-medium' : 'opacity-50'}`}>
            🍽 Dineout
          </Text>
          <View className="w-[1px] h-4 bg-gray-300" />
          <Text className={`text-gray-800 ${mode === 'instamart' ? 'opacity-100 font-medium' : 'opacity-50'}`}>
            🛒 Instamart
          </Text>
        </BlurView>
      </Pressable>

      <View className="flex-row gap-2">
        <Pressable className="w-10 h-10 rounded-full overflow-hidden">
          <BlurView intensity={60} tint="light" className="flex-1 items-center justify-center border border-white/60 bg-white/40">
            <Zap size={20} color="#1f2937" />
          </BlurView>
        </Pressable>
        <Pressable className="w-10 h-10 rounded-full overflow-hidden">
          <BlurView intensity={60} tint="light" className="flex-1 items-center justify-center border border-white/60 bg-white/40">
            <Settings size={20} color="#1f2937" />
          </BlurView>
        </Pressable>
      </View>
    </View>
  );
}
