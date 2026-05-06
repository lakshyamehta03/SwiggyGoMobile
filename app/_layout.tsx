import '../global.css';
import { ThemeProvider, DefaultTheme } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';
import { View } from 'react-native';
import { CameraBackground } from '@/src/components/feature/CameraBackground';

export const unstable_settings = {
  anchor: 'index',
};

// Spread DefaultTheme to inherit fonts and other required properties,
// then override only the colors we need.
const CustomTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: 'rgb(0, 212, 170)',
    background: 'transparent',
  },
};

export default function RootLayout() {
  return (
    <ThemeProvider value={CustomTheme}>
      <View style={{ flex: 1, backgroundColor: 'black' }}>
        <CameraBackground />
        
        <Stack
          screenOptions={{
            headerShown: false,
            contentStyle: { backgroundColor: 'transparent' },
            animation: 'fade',
          }}
        >
          <Stack.Screen name="index" />
          <Stack.Screen name="product/[id]" options={{ presentation: 'formSheet' }} />
          <Stack.Screen name="restaurant/[id]" options={{ presentation: 'formSheet' }} />
        </Stack>
      </View>
      <StatusBar style="light" />
    </ThemeProvider>
  );
}
