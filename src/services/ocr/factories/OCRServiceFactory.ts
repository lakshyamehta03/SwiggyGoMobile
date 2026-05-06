import type { IOCRService } from '../interfaces/OCRService';
import { MockOCRService } from '../implementations/MockOCRService';

/**
 * OCR Provider identifier.
 *
 * Migration path:
 *   'mock'                → Phase 1 (MVP, Expo Go)
 *   'google-cloud-vision' → Phase 2 (Expo Go, requires API key)
 *   'mlkit'               → Phase 3 (Development Build only)
 */
export type OCRProviderType = 'mock' | 'google-cloud-vision' | 'mlkit';

/**
 * Factory for creating OCR service instances.
 *
 * Usage:
 *   const service = OCRServiceFactory.create('mock');
 *   const response = await service.recognizeText({ imageUri: '...' });
 *
 * Swapping providers is a one-line change — no UI modifications needed.
 * Configure via environment variable or feature flag:
 *   OCRServiceFactory.create(process.env.OCR_PROVIDER ?? 'mock');
 */
export class OCRServiceFactory {
  private static instances = new Map<OCRProviderType, IOCRService>();

  /**
   * Create or retrieve a singleton OCR service instance.
   *
   * @param provider - Which OCR backend to use
   * @returns An IOCRService implementation
   * @throws Error if the requested provider is not yet implemented
   */
  static create(provider: OCRProviderType = 'mock'): IOCRService {
    // Return cached instance if available
    const cached = this.instances.get(provider);
    if (cached) return cached;

    let service: IOCRService;

    switch (provider) {
      case 'mock':
        service = new MockOCRService();
        break;

      case 'google-cloud-vision':
        // Phase 2: Uncomment when GoogleVisionOCRService is implemented
        // import { GoogleVisionOCRService } from '../implementations/GoogleVisionOCRService';
        // service = new GoogleVisionOCRService(API_KEY);
        throw new Error(
          'GoogleVisionOCRService is not yet implemented. ' +
          'Create src/services/ocr/implementations/GoogleVisionOCRService.ts ' +
          'implementing IOCRService, then register it here.'
        );

      case 'mlkit':
        // Phase 3: Requires Development Build — will NOT work in Expo Go
        // import { MLKitOCRService } from '../implementations/MLKitOCRService';
        // service = new MLKitOCRService();
        throw new Error(
          'MLKitOCRService is not yet implemented. ' +
          'Requires a Development Build (npx expo run:android). ' +
          'Create src/services/ocr/implementations/MLKitOCRService.ts ' +
          'implementing IOCRService, then register it here.'
        );

      default:
        throw new Error(`Unknown OCR provider: "${provider}"`);
    }

    this.instances.set(provider, service);
    return service;
  }

  /** Clear all cached instances (useful for testing) */
  static clearInstances(): void {
    this.instances.clear();
  }
}
