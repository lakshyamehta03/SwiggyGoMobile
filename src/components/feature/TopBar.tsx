import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, FlatList } from 'react-native';
import { Menu, Settings, MapPin, ChevronDown, Check } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ScanningMode } from '@/src/types/detection';
import { ENABLED_MODES, getDetectionStrategy } from '@/src/config/detection-config';
import { useInstamart } from '@/src/store/instamart-store';
import { BlurView } from 'expo-blur';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';

interface TopBarProps {
  mode: ScanningMode;
  onModeToggle: () => void;
}

/**
 * TopBar — 4-column layout: Menu | Mode Pill | Address Selector | Settings
 */
export function TopBar({ mode, onModeToggle }: TopBarProps) {
  const insets = useSafeAreaInsets();
  const { state: instamartState, setSelectedAddress, selectedAddress, refreshAddresses } = useInstamart();
  const [showAddressPicker, setShowAddressPicker] = React.useState(false);

  // Manual trigger for addresses in TopBar
  React.useEffect(() => {
    if (showAddressPicker) {
      refreshAddresses();
    }
  }, [showAddressPicker, refreshAddresses]);

  const showToggle = ENABLED_MODES.length > 1;

  // Render the mode toggle pill
  const renderModeToggle = () => {
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

    const config = getDetectionStrategy(mode).getDisplayConfig();
    return (
      <View style={styles.staticTitleContainer}>
        <Text style={styles.staticTitle}>{config.label}</Text>
      </View>
    );
  };

  return (
    <>
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

        {/* Mode Toggle */}
        <View style={styles.centerSection}>
          {renderModeToggle()}
        </View>

        {/* Address Selector */}
        <View style={styles.addressSection}>
          <Pressable 
            onPress={() => setShowAddressPicker(true)} 
            style={styles.addressPill}
          >
            <MapPin size={14} color="#00D4AA" />
            <Text style={styles.addressText} numberOfLines={1}>
              {selectedAddress?.tag || selectedAddress?.area || 'Select Address'}
            </Text>
            <ChevronDown size={14} color="rgba(255, 255, 255, 0.5)" />
          </Pressable>
        </View>

        {/* Right — Settings */}
        <View style={styles.sideColumn}>
          <Pressable style={[styles.iconButton, { alignSelf: 'flex-end' }]} hitSlop={6}>
            <Settings size={18} color="#ffffff" />
          </Pressable>
        </View>
      </View>

      {/* Address Picker Modal */}
      <Modal
        visible={showAddressPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddressPicker(false)}
      >
        <Pressable 
          style={styles.modalOverlay} 
          onPress={() => setShowAddressPicker(false)}
        >
          <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.modalContent}>
            <BlurView intensity={80} tint="dark" style={styles.addressDropdown}>
              <Text style={styles.dropdownTitle}>Delivery Address</Text>
              
              <FlatList
                data={instamartState.addresses}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => {
                  const isActive = item.id === instamartState.selectedAddressId;
                  return (
                    <Pressable
                      style={[styles.addressItem, isActive && styles.addressItemActive]}
                      onPress={() => {
                        setSelectedAddress(item.id);
                        setShowAddressPicker(false);
                      }}
                    >
                      <View style={styles.addressItemInfo}>
                        <Text style={styles.addressTag}>{item.tag || 'Other'}</Text>
                        <Text style={styles.addressLine} numberOfLines={1}>{item.line}</Text>
                      </View>
                      {isActive && <Check size={16} color="#00D4AA" />}
                    </Pressable>
                  );
                }}
                style={styles.addressList}
              />
            </BlurView>
          </Animated.View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 12,
    right: 12,
    zIndex: 50,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sideColumn: {
    width: 44,
  },
  centerSection: {
    flexShrink: 1,
  },
  addressSection: {
    flex: 1,
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
  },
  modePill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  modeItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  modeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  modeActive: {
    color: '#ffffff',
  },
  modeInactive: {
    color: 'rgba(255, 255, 255, 0.4)',
  },
  modeDivider: {
    width: 1,
    height: 14,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    marginHorizontal: 8,
  },
  staticTitleContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
  },
  staticTitle: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  // Address Selector Pill
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    borderRadius: 22,
    paddingHorizontal: 12,
    height: 44,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
    gap: 6,
  },
  addressText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },

  // Modal / Dropdown
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-start',
    paddingTop: 100, // Adjust based on TopBar height
    paddingHorizontal: 16,
  },
  modalContent: {
    width: '100%',
  },
  addressDropdown: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    maxHeight: 400,
  },
  dropdownTitle: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  addressList: {
    paddingBottom: 20,
  },
  addressItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  addressItemActive: {
    backgroundColor: 'rgba(0, 212, 170, 0.1)',
  },
  addressItemInfo: {
    flex: 1,
    gap: 2,
  },
  addressTag: {
    color: '#ffffff',
    fontSize: 15,
    fontWeight: '700',
  },
  addressLine: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: 13,
  },
});
