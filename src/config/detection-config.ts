import type { IDetectionStrategy } from '@/src/services/detection/interfaces/IDetectionStrategy';
import { DineoutDetectionStrategy } from '@/src/services/detection/strategies/DineoutDetectionStrategy';
import { InstamartDetectionStrategy } from '@/src/services/detection/strategies/InstamartDetectionStrategy';
import { ScanningMode } from '@/src/types/detection';

/**
 * Registry of all available detection strategies.
 * This satisfies the Open/Closed principle: adding a new mode only requires
 * adding it to this map.
 */
export const DETECTION_STRATEGIES: Record<ScanningMode, IDetectionStrategy> = {
  [ScanningMode.INSTAMART]: new InstamartDetectionStrategy(),
  [ScanningMode.DINEOUT]: new DineoutDetectionStrategy(),
};

/**
 * List of modes enabled in the current build.
 * To focus on Instamart first, we only include INSTAMART here.
 * Adding DINEOUT back will automatically enable it in the UI.
 */
export const ENABLED_MODES: ScanningMode[] = [
  ScanningMode.INSTAMART,
  // ScanningMode.DINEOUT, // Focused on Instamart
];

/**
 * Helper to get the strategy for a given mode.
 */
export function getDetectionStrategy(mode: ScanningMode): IDetectionStrategy {
  const strategy = DETECTION_STRATEGIES[mode];
  if (!strategy) {
    throw new Error(`No strategy registered for mode: ${mode}`);
  }
  return strategy;
}
