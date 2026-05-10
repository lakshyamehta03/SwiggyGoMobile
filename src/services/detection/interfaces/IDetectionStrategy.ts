import type { OCRResponse } from '@/src/services/ocr';
import type { ProcessedResult, ModeDisplayConfig } from '@/src/types/detection';

/**
 * Strategy contract for mode-specific detection processing.
 *
 * Each mode (Instamart, Dineout) implements this interface to handle:
 * 1. How OCR results are sent to their respective backends (process).
 * 2. How the Results screen should look (getDisplayConfig).
 */
export interface IDetectionStrategy {
  /**
   * Process raw OCR detections and return enriched results.
   * This is where specific API calls (e.g. Instamart search) happen.
   */
  process(ocrResponse: OCRResponse, options?: { addressId?: string }): Promise<ProcessedResult[]>;

  /**
   * Returns the UI configuration for this mode.
   * Allows the UI to be completely data-driven.
   */
  getDisplayConfig(): ModeDisplayConfig;

  /**
   * Optional: Define quick actions available for this mode's results.
   */
  getQuickActions(result: ProcessedResult): Array<{
    label: string;
    icon: string;
    onPress: (result: ProcessedResult) => void;
    backgroundColor?: string;
    iconColor?: string;
  }>;
}
