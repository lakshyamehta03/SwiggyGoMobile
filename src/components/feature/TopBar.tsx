import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Menu, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface TopBarProps {
  mode: 'dineout' | 'instamart';
  onModeToggle: () => void;
}

/**
 * TopBar — 3-column layout: Menu | Mode Pill | Settings
 *
 * - Zap button removed (no functionality)
 * - Uses flexbox justifyContent: space-between for safe distribution
 * - Left/right columns have fixed width for centering the pill
 * - Safe area: paddingTop uses insets.top
 * - All buttons use truly circular dark backgrounds (no BlurView)
 */
export function TopBar({ mode, onModeToggle }: TopBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        { top: Math.max(insets.top, 12) + 4 },
      ]}
    >
      {/* Left — Menu */}
      <View style={styles.sideColumn}>
        <Pressable style={styles.iconButton} hitSlop={6}>
          <Menu size={20} color="#ffffff" />
        </Pressable>
      </View>

      {/* Center — Mode toggle pill */}
      <Pressable onPress={onModeToggle} style={styles.modePill}>
        <Text
          style={[
            styles.modeText,
            mode === 'dineout' ? styles.modeActive : styles.modeInactive,
          ]}
        >
          🍽 Dineout
        </Text>
        <View style={styles.modeDivider} />
        <Text
          style={[
            styles.modeText,
            mode === 'instamart' ? styles.modeActive : styles.modeInactive,
          ]}
        >
          🛒 Instamart
        </Text>
      </Pressable>

      {/* Right — Settings */}
      <View style={[styles.sideColumn, { alignItems: 'flex-end' }]}>
        <Pressable style={styles.iconButton} hitSlop={6}>
          <Settings size={18} color="#ffffff" />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sideColumn: {
    width: 44,
    alignItems: 'flex-start',
  },
  iconButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  modeText: {
    fontSize: 13,
  },
  modeActive: {
    color: '#ffffff',
    fontWeight: '600',
  },
  modeInactive: {
    color: 'rgba(255, 255, 255, 0.4)',
    fontWeight: '400',
  },
  modeDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
});
