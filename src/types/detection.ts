import type { OCRDetection } from '@/src/services/ocr';

/**
 * Available scanning modes in the application.
 * Using an enum ensures type safety and prevents magic strings.
 */
export enum ScanningMode {
  INSTAMART = 'instamart',
  DINEOUT = 'dineout',
}

/**
 * Represents a result after it has been processed by a mode-specific strategy.
 * This can include backend-specific IDs, enriched metadata, or normalized fields.
 */
export interface ProcessedResult {
  /** Original OCR detection that triggered this result */
  detection: OCRDetection;
  /** Enriched title from the strategy (e.g. actual product name) */
  title: string;
  /** Enriched subtitle (e.g. price, category, or distance) */
  subtitle?: string;
  /** Unique identifier from the specific backend (Instamart SKU, Restaurant ID) */
  externalId?: string;
  /** Metadata returned by the specific strategy API */
  metadata?: Record<string, any>;
}

/**
 * Configuration for the UI presentation of a mode.
 */
export interface ModeDisplayConfig {
  /** Large title shown in the hint overlay */
  hintTitle: string;
  /** Subtitle shown in the hint overlay */
  hintSubtitle: string;
  /** Label shown during processing */
  processingLabel: string;
  /** Label for the mode (e.g. "Instamart") */
  label: string;
  /** Emoji or icon name for the mode */
  icon: string;
  /** Color theme for this mode */
  themeColor: string;
}
