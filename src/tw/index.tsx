/**
 * CSS-enabled component re-exports for NativeWind v4.
 *
 * NativeWind v4 uses a babel transform (nativewind/babel) that automatically
 * adds className support to all React Native core components.
 * We re-export them here so all imports across the app go through one place,
 * making a future upgrade to NativeWind v5 a single-file change.
 */

export {
  View,
  Text,
  Pressable,
  ScrollView,
  TextInput,
} from "react-native";

export type { ViewProps } from "react-native";

export { Link } from "expo-router";

export { Image } from "expo-image";
