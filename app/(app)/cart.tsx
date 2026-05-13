import { Toast } from '@/src/components/common/Toast';
import { useInstamart } from '@/src/store/instamart-store';
import { BlurView } from 'expo-blur';
import { router, Stack } from 'expo-router';
import { ArrowLeft, ChevronRight, MapPin, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react-native';
import React from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeInRight, FadeOutLeft, Layout } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function CartScreen() {
  const { state, updateItemQuantity, removeItem, selectedAddress, clearError } = useInstamart();
  const insets = useSafeAreaInsets();
  const { cart, isLoading, error } = state;

  // Wait for initial address load to avoid confusing empty states
  if (isLoading && !selectedAddress) {
    return (
      <View style={styles.loaderOverlay}>
        <ActivityIndicator size="large" color="#FF6B35" />
      </View>
    );
  }

  const handleIncrease = (spinId: string, currentQty: number) => {
    updateItemQuantity(spinId, currentQty + 1);
  };

  const handleDecrease = (spinId: string, currentQty: number) => {
    if (currentQty > 1) {
      updateItemQuantity(spinId, currentQty - 1);
    } else {
      removeItem(spinId);
    }
  };

  if (!cart || cart.items.length === 0) {
    return (
      <View style={styles.container}>
        <Stack.Screen options={{ title: 'Your Cart', headerShown: false }} />

        <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <ArrowLeft size={24} color="#1f2937" />
          </Pressable>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={styles.emptyState}>
          <View style={styles.emptyIconContainer}>
            <ShoppingBag size={64} color="#e5e7eb" />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySubtitle}>
            Looks like you haven't added anything to your cart yet.
          </Text>
          <Pressable
            onPress={() => router.push('/')}
            style={styles.browseButton}
          >
            <Text style={styles.browseButtonText}>Browse Products</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Your Cart', headerShown: false }} />

      {/* Header */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 16) }]}>
        <Pressable onPress={() => router.back()} style={styles.backButton}>
          <ArrowLeft size={24} color="#1f2937" />
        </Pressable>
        <View>
          <Text style={styles.headerTitle}>Your Cart</Text>
          <View style={styles.addressRow}>
            <MapPin size={12} color="#FF6B35" />
            <Text style={styles.addressText}>{selectedAddress?.tag || 'Selected Address'}</Text>
          </View>
        </View>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 }
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Cart Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{cart.items.length} {cart.items.length === 1 ? 'Item' : 'Items'}</Text>
          {cart.items.map((item, index) => (
            <Animated.View
              key={item.spinId}
              layout={Layout.springify()}
              entering={FadeInRight.delay(index * 100)}
              exiting={FadeOutLeft}
              style={styles.cartItem}
            >
              <View style={styles.itemInfo}>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              </View>

              <View style={styles.quantityContainer}>
                <Pressable
                  onPress={() => handleDecrease(item.spinId, item.quantity)}
                  style={styles.qtyButton}
                >
                  {item.quantity === 1 ? (
                    <Trash2 size={16} color="#ef4444" />
                  ) : (
                    <Minus size={16} color="#4b5563" />
                  )}
                </Pressable>
                <Text style={styles.qtyText}>{item.quantity}</Text>
                <Pressable
                  onPress={() => handleIncrease(item.spinId, item.quantity)}
                  style={styles.qtyButton}
                >
                  <Plus size={16} color="#4b5563" />
                </Pressable>
              </View>
            </Animated.View>
          ))}
        </View>

        {/* Bill Breakdown */}
        <View style={styles.billContainer}>
          <Text style={styles.billTitle}>Bill Details</Text>
          {cart.billBreakdown.map((line, idx) => (
            <View key={idx} style={styles.billRow}>
              <Text style={styles.billLabel}>{line.label}</Text>
              <Text style={[
                styles.billValue,
                line.label.toLowerCase().includes('discount') && { color: '#059669' }
              ]}>
                {line.value < 0 ? `-${Math.abs(line.value)}` : `${line.value}`}
              </Text>
            </View>
          ))}
          <View style={styles.divider} />
          <View style={styles.billRow}>
            <Text style={styles.totalLabel}>To Pay</Text>
            <Text style={styles.totalValue}>{cart.toPay}</Text>
          </View>
        </View>
      </ScrollView>

      {/* Error Toast */}
      <Toast
        visible={!!error}
        message={error || ''}
        onHide={clearError}
      />

      {/* Sticky Footer */}
      <BlurView intensity={80} tint="light" style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) + 16 }]}>
        <View style={styles.footerContent}>
          <View>
            <Text style={styles.footerTotal}>{cart.toPay}</Text>
            <Text style={styles.viewDetailedBill}>View Detailed Bill</Text>
          </View>
          <Pressable style={styles.checkoutButton}>
            <Text style={styles.checkoutText}>Proceed to Pay</Text>
            <ChevronRight size={20} color="#fff" />
          </Pressable>
        </View>
      </BlurView>

      {isLoading && (
        <View style={styles.loaderOverlay}>
          <ActivityIndicator size="large" color="#FF6B35" />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: '#fff',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  addressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  addressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  scrollContent: {
    paddingTop: 16,
  },
  section: {
    backgroundColor: '#fff',
    paddingHorizontal: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#4b5563',
    paddingVertical: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  cartItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#f3f4f6',
  },
  itemInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  itemImageContainer: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  itemEmoji: {
    fontSize: 24,
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 2,
  },
  itemPrice: {
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    padding: 4,
    gap: 12,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    minWidth: 16,
    textAlign: 'center',
  },
  billContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: '#e5e7eb',
  },
  billTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 16,
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  billLabel: {
    fontSize: 14,
    color: '#4b5563',
  },
  billValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '500',
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#e5e7eb',
    marginVertical: 12,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#e5e7eb',
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  footerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  footerTotal: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
  },
  viewDetailedBill: {
    fontSize: 12,
    color: '#FF6B35',
    fontWeight: '600',
  },
  checkoutButton: {
    backgroundColor: '#FF6B35',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 14,
    gap: 8,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  checkoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 15,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 32,
  },
  browseButton: {
    backgroundColor: '#111827',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 14,
  },
  browseButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loaderOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 999,
  },
});
