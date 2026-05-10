import { View, Text, Pressable, StyleSheet } from 'react-native';
import { Menu, Settings } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanningMode } from '@/src/types/detection';
import { ENABLED_MODES, getDetectionStrategy } from '@/src/config/detection-config';

interface TopBarProps {
  mode: ScanningMode;
  onModeToggle: () => void;
}

/**
 * TopBar — 3-column layout: Menu | Mode Pill/Title | Settings
 *
 * Refactored for Extensibility:
 * - Dynamically renders the mode toggle based on ENABLED_MODES.
 * - If only one mode is enabled, it shows a static label instead of a toggle pill.
 * - Labels are pulled from the respective mode's Strategy.
 */
export function TopBar({ mode, onModeToggle }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const showToggle = ENABLED_MODES.length > 1;

  // Render the center piece (Toggle Pill or Static Title)
  const renderCenter = () => {
    if (showToggle) {
      return (
        <Pressable onPress={onModeToggle} style={styles.modePill}>
          {ENABLED_MODES.map((m, index) => {
            const config = getDetectionStrategy(m).getDisplayConfig();
            const isActive = mode === m;
            return (
              <View key={m} style={styles.modeItemContainer}>
                <Text
                  style={[
                    styles.modeText,
                    isActive ? styles.modeActive : styles.modeInactive,
                  ]}
                >
                  {config.icon} {config.label}
                </Text>
                {index < ENABLED_MODES.length - 1 && <View style={styles.modeDivider} />}
              </View>
            );
          })}
        </Pressable>
      );
    }

    // Static title for single mode
    const config = getDetectionStrategy(mode).getDisplayConfig();
    return (
      <View style={styles.staticTitleContainer}>
        <Text style={styles.staticTitle}>
          {config.label}
        </Text>
      </View>
    );
  };

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

      {/* Center */}
      {renderCenter()}

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
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    overflow: 'hidden',
  },
  modeItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
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
    marginHorizontal: 10,
  },
  staticTitleContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  staticTitle: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
