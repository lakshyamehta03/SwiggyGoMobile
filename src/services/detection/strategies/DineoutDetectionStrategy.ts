import type { IDetectionStrategy } from '../interfaces/IDetectionStrategy';
import type { OCRResponse } from '@/src/services/ocr';
import type { ProcessedResult, ModeDisplayConfig } from '@/src/types/detection';
import { router } from 'expo-router';

export class DineoutDetectionStrategy implements IDetectionStrategy {
  async process(ocrResponse: OCRResponse, options?: { addressId?: string }): Promise<ProcessedResult[]> {
    // Phase 2/3: This would be a fetch() call to the Dineout/Restaurant API
    return ocrResponse.detections.map((d) => ({
      detection: d,
      title: d.normalizedText,
      subtitle: 'Restaurant • Menu & Offers',
      externalId: `restaurant_${d.id}`,
      metadata: { type: 'restaurant' },
    }));
  }

  getDisplayConfig(): ModeDisplayConfig {
    return {
      hintTitle: 'Point at a restaurant',
      hintSubtitle: 'Works best for signs & menus',
      processingLabel: 'Finding restaurant...',
      label: 'Dineout',
      icon: '🍽',
      themeColor: '#00D4AA', // Swiggy Teal
    };
  }

  getQuickActions(result: ProcessedResult) {
    return [
      {
        label: 'View Menu',
        icon: 'book-open',
        onPress: () => router.push(`/restaurant/${result.externalId}` as any),
        backgroundColor: '#e8faf5',
        iconColor: '#00D4AA',
      },
      {
        label: 'Get Directions',
        icon: 'map-pin',
        onPress: () => console.log('Opening maps for', result.title),
        backgroundColor: '#fef3c7',
        iconColor: '#f59e0b',
      },
    ];
  }
}
