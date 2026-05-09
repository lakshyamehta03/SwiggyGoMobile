import React from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import Animated, { FadeInUp } from 'react-native-reanimated';
import { router } from 'expo-router';
import { ArrowLeft, MapPin, ShoppingBag, ChevronRight } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useDetection } from '@/src/store/detection-store';

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
  const { state, selectResult, selectedResult, clear } = useDetection();
  const insets = useSafeAreaInsets();
  const { results } = state;

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

  const isRestaurant = (text: string) => {
    const lower = text.toLowerCase();
    return (
      lower.includes('pizza') ||
      lower.includes('cafe') ||
      lower.includes('nation') ||
      lower.includes('mcdonald') ||
      lower.includes('subway') ||
      lower.includes('haldiram') ||
      lower.includes('hut') ||
      lower.includes('domino')
    );
  };

  return (
    <View style={styles.container}>
      {/* Header — respects top safe area */}
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 8) }]}>
        <Pressable onPress={handleClose} hitSlop={8} style={styles.backButton}>
          <ArrowLeft size={20} color="#333" />
        </Pressable>
        <Text style={styles.headerTitle}>
          {results.length} {results.length === 1 ? 'Result' : 'Results'} Found
        </Text>
        <View style={{ width: 36 }} />
      </View>

      {/* Horizontal chips for multiple detections */}
      {results.length > 1 && (
        <View style={styles.chipsWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsContent}
          >
            {results.map((detection, index) => {
              const isSelected = state.selectedIndex === index;
              return (
                <Animated.View
                  key={detection.id}
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
                      {detection.normalizedText}
                    </Text>
                    <View style={[styles.chipBadge, isSelected && styles.chipBadgeSelected]}>
                      <Text style={[styles.chipBadgeText, isSelected && styles.chipBadgeTextSelected]}>
                        {Math.round(detection.confidence * 100)}%
                      </Text>
                    </View>
                  </Pressable>
                </Animated.View>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* Main content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: Math.max(insets.bottom, 16) + 16 },
        ]}
      >
        {selectedResult && (
          <Animated.View entering={FadeInUp.duration(350)}>
            {/* Result card */}
            <View style={styles.resultCard}>
              <View style={styles.resultIconContainer}>
                <Text style={{ fontSize: 28 }}>
                  {isRestaurant(selectedResult.normalizedText) ? '🍽' : '📦'}
                </Text>
              </View>

              <Text style={styles.resultName}>{selectedResult.normalizedText}</Text>

              {/* Confidence */}
              <View style={styles.confidenceRow}>
                <Text style={styles.confidenceLabel}>Confidence</Text>
                <View style={styles.confidenceTrack}>
                  <View
                    style={[
                      styles.confidenceFill,
                      { width: `${selectedResult.confidence * 100}%` },
                    ]}
                  />
                </View>
                <Text style={styles.confidenceValue}>
                  {Math.round(selectedResult.confidence * 100)}%
                </Text>
              </View>

              {/* Meta chips */}
              <View style={styles.metaRow}>
                <View style={styles.metaChip}>
                  <MapPin size={12} color="#6b7280" />
                  <Text style={styles.metaText}>Camera scan</Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>
                    {state.lastResponse?.metadata.processingTimeMs ?? 0}ms
                  </Text>
                </View>
                <View style={styles.metaChip}>
                  <Text style={styles.metaText}>
                    {state.lastResponse?.metadata.provider ?? 'mock'}
                  </Text>
                </View>
              </View>
            </View>

            {/* Actions */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>

            <Pressable
              style={styles.actionRow}
              onPress={() => {
                router.push(`/product/${encodeURIComponent(selectedResult.id)}` as any);
              }}
            >
              <View style={[styles.actionIcon, { backgroundColor: '#e8faf5' }]}>
                <ShoppingBag size={18} color="#00D4AA" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>View on Swiggy</Text>
                <Text style={styles.actionSubtitle}>Menu, prices, and reviews</Text>
              </View>
              <ChevronRight size={16} color="#d1d5db" />
            </Pressable>

            <Pressable style={styles.actionRow}>
              <View style={[styles.actionIcon, { backgroundColor: '#fef3c7' }]}>
                <MapPin size={18} color="#f59e0b" />
              </View>
              <View style={styles.actionContent}>
                <Text style={styles.actionTitle}>Get Directions</Text>
                <Text style={styles.actionSubtitle}>Open in Maps</Text>
              </View>
              <ChevronRight size={16} color="#d1d5db" />
            </Pressable>

            {/* Timestamp */}
            <Text style={styles.timestamp}>
              Scanned at{' '}
              {new Date(state.lastResponse?.metadata.timestamp ?? 0).toLocaleTimeString()}
            </Text>
          </Animated.View>
        )}
      </ScrollView>
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
  confidenceTrack: {
    flex: 1,
    height: 5,
    backgroundColor: '#e5e7eb',
    borderRadius: 3,
    overflow: 'hidden',
  },
  confidenceFill: {
    height: '100%',
    backgroundColor: '#00D4AA',
    borderRadius: 3,
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
    width: 34,
    textAlign: 'right',
    fontVariant: ['tabular-nums'],
  },

  // ─── Meta ────────────────────────────────────────────────────────
  metaRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  metaChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  metaText: {
    fontSize: 11,
    color: '#6b7280',
  },

  // ─── Actions ─────────────────────────────────────────────────────
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    letterSpacing: -0.1,
    marginTop: 4,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: '#f9fafb',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderCurve: 'continuous',
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    borderCurve: 'continuous',
  },
  actionContent: {
    flex: 1,
    gap: 2,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  actionSubtitle: {
    fontSize: 12,
    color: '#6b7280',
  },

  // ─── Footer ──────────────────────────────────────────────────────
  timestamp: {
    fontSize: 11,
    color: '#9ca3af',
    textAlign: 'center',
    marginTop: 4,
  },

  // ─── Empty State ─────────────────────────────────────────────────
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    gap: 10,
  },
  emptyIcon: {
    fontSize: 44,
    marginBottom: 4,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 20,
  },
  retryButton: {
    backgroundColor: '#00D4AA',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 999,
    marginTop: 8,
  },
  retryText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 15,
  },
});
