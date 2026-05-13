import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, ChevronRight, Info, ShoppingBag } from 'lucide-react-native';
import * as Icons from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDetection } from '@/src/store/detection-store';
import { getDetectionStrategy } from '@/src/config/detection-config';
import type { InstamartProduct } from '@/src/services/instamart';

/**
 * Detection Results — native formSheet with snap detents.
 *
 * Safe area handling:
 * - Top inset applied to header so content never hides behind notch/dynamic island
 * - Bottom inset applied to scroll content padding
 *
 * Layout alignment:
 * - Consistent 16px horizontal padding throughout
 * - 12px gaps between sections
 * - Icons aligned at leading edge with fixed 40px containers
 * - Typography: 15px body, 13px secondary, 11px meta
 */
export default function DetectionResultsScreen() {
  const { state, selectResult, clear, selectedProcessedResult } = useDetection();
  const insets = useSafeAreaInsets();
  const { results, activeMode } = state;

  const strategy = useMemo(() => 
    activeMode ? getDetectionStrategy(activeMode) : null
  , [activeMode]);

  const activeConfig = useMemo(() => 
    strategy?.getDisplayConfig()
  , [strategy]);

  const handleClose = () => {
    clear();
    router.back();
  };

  if (results.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
          <Pressable onPress={handleClose} hitSlop={8} style={styles.backButton}>
            <ArrowLeft size={20} color="#333" />
          </Pressable>
          <Text style={styles.headerTitle}>No Results</Text>
          <View style={{ width: 36 }} />
        </View>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No text detected</Text>
          <Text style={styles.emptySubtitle}>
            Try pointing the camera at a restaurant sign or product label
          </Text>
          <Pressable onPress={handleClose} style={styles.retryButton}>
            <Text style={styles.retryText}>Try Again</Text>
          </Pressable>
        </View>
      </View>
    );
  }

  const IconComponent = (props: { name: string; size?: number; color?: string }) => {
    // Check if it's an emoji or a Lucide icon name
    const LucideIcon = (Icons as any)[props.name.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('')];
    if (LucideIcon) return <LucideIcon size={props.size ?? 20} color={props.color ?? '#333'} />;
    return <Text style={{ fontSize: props.size ?? 20 }}>{props.name}</Text>;
  };

  return (
    <View style={styles.container}>
      {/* Header — respects top safe area */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        <Pressable onPress={handleClose} hitSlop={8} style={styles.backButton}>
          <ArrowLeft size={20} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {state.processedResults.length} {state.processedResults.length === 1 ? 'Result' : 'Results'} Found
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Horizontal tabs for matching products */}
      {state.processedResults.length > 1 && (
        <View style={styles.chipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {state.processedResults.map((result, index) => {
              const isSelected = state.selectedIndex === index;
              return (
                <Animated.View
                  key={result.externalId || index}
                  entering={FadeInUp.delay(index * 80).duration(300)}
                >
                  <Pressable
                    onPress={() => selectResult(index)}
                    style={[styles.chip, isSelected && styles.chipSelected]}
                  >
                    <Text
                      style={[styles.chipLabel, isSelected && styles.chipLabelSelected]}
                      numberOfLines={1}
                    >
                      {result.title}
                    </Text>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main content */}
      {/* Results List */}
      <Animated.FlatList
        data={state.processedResults}
        keyExtractor={(item, index) => item.externalId || index.toString()}
        contentContainerStyle={[
          styles.resultsList,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 }
        ]}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => {
          const product = item.metadata?.product as InstamartProduct | undefined;
          const variant = product?.variations[0];
          const isSelected = state.selectedIndex === index;

          return (
            <Animated.View
              entering={FadeInUp.delay(200 + index * 100).duration(500)}
              style={[styles.productCard, isSelected && styles.productCardSelected]}
            >
              <Pressable 
                onPress={() => selectResult(index)}
                style={styles.cardInner}
              >
                {/* Image Container */}
                <View style={styles.imageContainer}>
                  {variant?.imageUrl ? (
                    <Image
                      source={{ uri: variant.imageUrl }}
                      style={styles.productImage}
                      contentFit="contain"
                      transition={300}
                    />
                  ) : (
                    <View style={styles.imagePlaceholder}>
                      <Text style={styles.imageEmoji}>{index % 3 === 0 ? '🍜' : index % 3 === 1 ? '🥤' : '🍞'}</Text>
                    </View>
                  )}
                  {variant && variant.mrp > variant.price && (
                    <View style={styles.discountBadge}>
                      <Text style={styles.discountText}>
                        {Math.round(((variant.mrp - variant.price) / variant.mrp) * 100)}% OFF
                      </Text>
                    </View>
                  )}
                </View>

                {/* Product Info */}
                <View style={styles.infoContainer}>
                  <Text style={styles.brandText}>{product?.brand || 'Instamart'}</Text>
                  <Text style={styles.productName} numberOfLines={2}>{product?.name || item.title}</Text>
                  
                  <View style={styles.priceRow}>
                    <Text style={styles.priceText}>₹{variant?.price || 0}</Text>
                    {variant && variant.mrp > variant.price && (
                      <Text style={styles.mrpText}>₹{variant.mrp}</Text>
                    )}
                  </View>

                  <Pressable 
                    onPress={() => {
                      selectResult(index);
                      router.push(`/product/${item.externalId}` as any);
                    }}
                    style={styles.addButton}
                  >
                    <ShoppingBag size={14} color="#fff" />
                    <Text style={styles.addButtonText}>View Details</Text>
                  </Pressable>
                </View>
              </Pressable>
            </Animated.View>
          );
        }}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyIcon}>🔍</Text>
            <Text style={styles.emptyTitle}>No products found</Text>
            <Text style={styles.emptySubtitle}>
              Try adjusting your camera or focusing on a different part of the item.
            </Text>
            <Pressable onPress={() => router.back()} style={styles.retryButton}>
              <Text style={styles.retryText}>Try Again</Text>
            </Pressable>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },

  // ─── Header ──────────────────────────────────────────────────────
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#e5e7eb',
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f3f4f6',
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.2,
  },

  // ─── Chips ───────────────────────────────────────────────────────
  chipsWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#f3f4f6',
  },
  chipsContent: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    gap: 8,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    borderWidth: 1.5,
    borderColor: 'transparent',
    borderCurve: 'continuous',
  },
  chipSelected: {
    backgroundColor: '#e8faf5',
    borderColor: '#00D4AA',
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: '#374151',
    maxWidth: 120,
  },
  chipLabelSelected: {
    color: '#047857',
    fontWeight: '600',
  },
  chipBadge: {
    backgroundColor: '#e5e7eb',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  chipBadgeSelected: {
    backgroundColor: '#00D4AA',
  },
  chipBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#6b7280',
    fontVariant: ['tabular-nums'],
  },
  chipBadgeTextSelected: {
    color: '#ffffff',
  },

  // ─── Scroll Content ──────────────────────────────────────────────
  scrollContent: {
    padding: 16,
    gap: 12,
  },

  // ─── Result Card ─────────────────────────────────────────────────
  resultCard: {
    backgroundColor: '#f9fafb',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderCurve: 'continuous',
    alignItems: 'center',
    gap: 10,
  },
  resultIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderCurve: 'continuous',
  },
  resultName: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  resultSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    marginTop: -4,
    marginBottom: 4,
  },

  // ─── Confidence ──────────────────────────────────────────────────
  confidenceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    width: '100%',
    marginTop: 2,
  },
  confidenceLabel: {
    fontSize: 12,
    color: '#6b7280',
    width: 72,
  },
  // ─── Results List ────────────────────────────────────────────────
  resultsList: {
    paddingHorizontal: 16,
    paddingVertical: 20,
    gap: 16,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#f3f4f6',
    overflow: 'hidden',
    borderCurve: 'continuous',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 2,
  },
  productCardSelected: {
    borderColor: '#FF6B35',
    backgroundColor: '#fffaf8',
  },
  cardInner: {
    flexDirection: 'row',
    padding: 12,
    gap: 16,
  },
  imageContainer: {
    width: 100,
    height: 100,
    borderRadius: 14,
    backgroundColor: '#fff7f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  imageEmoji: {
    fontSize: 48,
  },
  discountBadge: {
    position: 'absolute',
    top: -4,
    left: -4,
    backgroundColor: '#00D4AA',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#ffffff',
  },
  discountText: {
    color: '#ffffff',
    fontSize: 10,
    fontWeight: '800',
  },
  infoContainer: {
    flex: 1,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  brandText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#9ca3af',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: 20,
    marginTop: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  priceText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  mrpText: {
    fontSize: 13,
    color: '#9ca3af',
    textDecorationLine: 'line-through',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FF6B35',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginTop: 10,
    borderCurve: 'continuous',
  },
  addButtonText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },

  // ─── Empty State ─────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 80,
  },
  emptyIcon: {
    fontSize: 56,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  retryButton: {
    backgroundColor: '#FF6B35',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 16,
    shadowColor: '#FF6B35',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '700',
    fontSize: 16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
