import type { IDetectionStrategy } from '../interfaces/IDetectionStrategy';
import type { OCRResponse } from '@/src/services/ocr';
import type { ProcessedResult, ModeDisplayConfig } from '@/src/types/detection';
import { router } from 'expo-router';
import { instamartService } from '../../instamart';

export class InstamartDetectionStrategy implements IDetectionStrategy {
  async process(ocrResponse: OCRResponse, options?: { addressId?: string }): Promise<ProcessedResult[]> {
    if (!options?.addressId || !ocrResponse.fullText.trim()) {
      return ocrResponse.detections.map((d) => ({
        detection: d,
        title: d.normalizedText,
        subtitle: 'Instamart • No products found',
        metadata: { type: 'product' },
      }));
    }

    // 1. Clean the full text (replace newlines with spaces and remove noise)
    let unifiedQuery = ocrResponse.fullText
      .replace(/\n/g, ' ')
      .replace(/[^\w\s]/gi, '') // Remove special characters
      .trim();

    const products = await instamartService.search(unifiedQuery, options.addressId!);

    if (products.length === 0) {
      return ocrResponse.detections.map((d) => ({
        detection: d,
        title: d.normalizedText,
        subtitle: 'Instamart • No product found',
        metadata: { type: 'product' },
      }));
    }

    return products.map((product) => ({
      detection: ocrResponse.detections[0] || { id: 'root', normalizedText: unifiedQuery },
      title: product.name,
      subtitle: `${product.brand} • ₹${product.variations[0]?.price || 0}`,
      externalId: product.id,
      metadata: { type: 'product', product },
    }));
  }

  getDisplayConfig(): ModeDisplayConfig {
    return {
      hintTitle: 'Point at a product',
      hintSubtitle: 'Works best for groceries & snacks',
      processingLabel: 'Identifying product...',
      label: 'Instamart',
      icon: '🛒',
      themeColor: '#FF6B35', // Instamart orange
    };
  }

  getQuickActions(result: ProcessedResult) {
    return [
      {
        label: 'Add to Cart',
        icon: 'shopping-bag',
        onPress: () => router.push(`/product/${result.externalId}` as any),
        backgroundColor: '#e8faf5',
        iconColor: '#00D4AA',
      },
    ];
  }
}
