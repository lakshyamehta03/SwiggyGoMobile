/**
 * OCR Service — Public API
 *
 * Single import point for all OCR functionality:
 *   import { OCRServiceFactory, type IOCRService, type OCRResponse } from '@/src/services/ocr';
 */

// Interfaces (what consumers depend on)
export type {
  IOCRService,
  OCRRequest,
  OCRResponse,
  OCRDetection,
  OCRMetadata,
  NormalizedBoundingBox,
} from './interfaces/OCRService';

// Factory (how consumers get a service instance)
export { OCRServiceFactory, type OCRProviderType } from './factories/OCRServiceFactory';
