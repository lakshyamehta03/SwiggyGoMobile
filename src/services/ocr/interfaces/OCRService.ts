/**
 * OCR Service Interfaces
 *
 * All OCR providers (Mock, Cloud Vision, ML Kit) must implement IOCRService.
 * The UI layer depends ONLY on these interfaces — never on concrete implementations.
 *
 * Migration path:
 *   Phase 1 (MVP):  MockOCRService      — works in Expo Go
 *   Phase 2:        GoogleVisionService  — works in Expo Go (REST API)
 *   Phase 3:        MLKitOCRService      — requires Development Build
 */

/** Bounding box coordinates normalized to [0, 1] relative to image dimensions */
export interface NormalizedBoundingBox {
  /** Top-left X (0–1) */
  x: number;
  /** Top-left Y (0–1) */
  y: number;
  /** Width (0–1) */
  width: number;
  /** Height (0–1) */
  height: number;
}

/** A single text detection within an image */
export interface OCRDetection {
  /** Unique ID for this detection */
  id: string;
  /** The raw detected text */
  rawText: string;
  /** Cleaned/normalized text (trimmed, collapsed whitespace) */
  normalizedText: string;
  /** Confidence score 0–1 */
  confidence: number;
  /** Bounding box of the detected text region */
  boundingBox: NormalizedBoundingBox;
  /** ISO language code if detected */
  language?: string;
}

/** Metadata about the OCR operation itself */
export interface OCRMetadata {
  /** Which provider produced this result */
  provider: 'mock' | 'google-cloud-vision' | 'mlkit' | string;
  /** Processing time in milliseconds */
  processingTimeMs: number;
  /** Timestamp of when recognition was performed */
  timestamp: number;
  /** Source image URI that was processed */
  sourceImageUri: string;
  /** Dimensions of the source image */
  imageSize?: { width: number; height: number };
}

/** Complete OCR response from any provider */
export interface OCRResponse {
  /** Whether the operation succeeded */
  success: boolean;
  /** All detected text blocks */
  detections: OCRDetection[];
  /** Full concatenated text from all detections */
  fullText: string;
  /** Operation metadata */
  metadata: OCRMetadata;
  /** Error message if success is false */
  error?: string;
}

/** Configuration for an OCR recognition request */
export interface OCRRequest {
  /** Local file URI of the image to process */
  imageUri: string;
  /** Optional: restrict recognition to a cropped region (normalized coords) */
  regionOfInterest?: NormalizedBoundingBox;
  /** Maximum number of results to return */
  maxResults?: number;
}

/**
 * The contract every OCR provider must fulfill.
 * Swap providers by changing the factory — zero UI changes needed.
 */
export interface IOCRService {
  /** Human-readable name of this provider */
  readonly providerName: string;

  /** Whether this provider requires native code (Development Build) */
  readonly requiresNativeBuild: boolean;

  /** Perform text recognition on an image */
  recognizeText(request: OCRRequest): Promise<OCRResponse>;

  /** Check if this provider is available/configured in the current environment */
  isAvailable(): Promise<boolean>;
}
