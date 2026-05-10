import type { IDetectionStrategy } from '../interfaces/IDetectionStrategy';
import type { OCRResponse } from '@/src/services/ocr';
import type { ProcessedResult, ModeDisplayConfig } from '@/src/types/detection';
import { router } from 'expo-router';
import { instamartService } from '../../instamart';

export class InstamartDetectionStrategy implements IDetectionStrategy {
  async process(ocrResponse: OCRResponse, options?: { addressId?: string }): Promise<ProcessedResult[]> {
    // 1. Get query from OCR (use the first detection for now as primary)
    const primaryQuery = ocrResponse.detections[0]?.normalizedText;
    if (!primaryQuery || !options?.addressId) {
      return ocrResponse.detections.map((d) => ({
        detection: d,
        title: d.normalizedText,
        subtitle: 'Instamart • No product found',
        metadata: { type: 'product' },
      }));
    }

    // 2. Call search API
    const products = await instamartService.search(primaryQuery, options.addressId);

    // 3. Map to ProcessedResults
    // If multiple products found, we map them. 
    // Note: The OCR might have multiple detections, but we start with the primary one.
    return products.map((product) => ({
      detection: ocrResponse.detections[0], // Associate with the primary detection
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
