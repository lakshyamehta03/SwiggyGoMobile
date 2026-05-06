import type {
  IOCRService,
  OCRRequest,
  OCRResponse,
  OCRDetection,
} from '../interfaces/OCRService';

/**
 * Mock restaurant and product datasets for realistic simulation.
 */
const MOCK_RESTAURANTS = [
  { name: 'Barbeque Nation', cuisine: 'BBQ · North Indian · Buffet', rating: 4.3 },
  { name: 'Pizza Hut', cuisine: 'Pizza · Italian · Fast Food', rating: 4.0 },
  { name: 'Dominos Pizza', cuisine: 'Pizza · Fast Food', rating: 3.8 },
  { name: 'Haldiram\'s', cuisine: 'North Indian · Sweets · Snacks', rating: 4.5 },
  { name: 'McDonald\'s', cuisine: 'Burgers · Fast Food', rating: 3.9 },
  { name: 'Cafe Coffee Day', cuisine: 'Cafe · Beverages · Snacks', rating: 4.1 },
  { name: 'Subway', cuisine: 'Sandwich · Healthy · Fast Food', rating: 4.0 },
];

const MOCK_PRODUCTS = [
  { name: 'Maggi 2-Minute Noodles', brand: 'Nestle', price: 14 },
  { name: 'Coca-Cola 750ml', brand: 'Coca-Cola', price: 40 },
  { name: 'Amul Butter 500g', brand: 'Amul', price: 270 },
  { name: 'Lays Classic Chips', brand: 'PepsiCo', price: 20 },
  { name: 'Red Bull Energy Drink', brand: 'Red Bull', price: 125 },
  { name: 'Parle-G Biscuits', brand: 'Parle', price: 10 },
];

function generateId(): string {
  return `det_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
}

function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

function randomInt(min: number, max: number): number {
  return Math.floor(randomFloat(min, max + 1));
}

/**
 * MockOCRService — Phase 1 OCR provider.
 *
 * Simulates realistic OCR responses with:
 * - Variable number of detections (1–4)
 * - Realistic confidence scores (0.65–0.98)
 * - Random restaurant/product names
 * - Simulated async processing delay (300–800ms)
 * - Occasional error simulation (~5% chance)
 *
 * Works fully in Expo Go — no native dependencies.
 */
export class MockOCRService implements IOCRService {
  readonly providerName = 'mock';
  readonly requiresNativeBuild = false;

  private simulateError = false;
  private detectionMode: 'restaurant' | 'product' | 'mixed' = 'mixed';

  /** Configure the mock to simulate errors for testing */
  setSimulateError(simulate: boolean): void {
    this.simulateError = simulate;
  }

  /** Set detection mode: restaurant-only, product-only, or mixed */
  setDetectionMode(mode: 'restaurant' | 'product' | 'mixed'): void {
    this.detectionMode = mode;
  }

  async isAvailable(): Promise<boolean> {
    return true; // Mock is always available
  }

  async recognizeText(request: OCRRequest): Promise<OCRResponse> {
    const startTime = Date.now();

    // Simulate processing delay
    const delay = randomInt(300, 800);
    await new Promise((resolve) => setTimeout(resolve, delay));

    // 5% chance of simulated error (or forced via config)
    if (this.simulateError || Math.random() < 0.05) {
      return {
        success: false,
        detections: [],
        fullText: '',
        metadata: {
          provider: 'mock',
          processingTimeMs: Date.now() - startTime,
          timestamp: Date.now(),
          sourceImageUri: request.imageUri,
        },
        error: 'Mock OCR: Simulated recognition failure. Please try again.',
      };
    }

    // Generate 1–4 detections
    const numDetections = Math.min(
      request.maxResults ?? 4,
      randomInt(1, 4)
    );

    const detections: OCRDetection[] = [];

    for (let i = 0; i < numDetections; i++) {
      const isRestaurant =
        this.detectionMode === 'restaurant' ||
        (this.detectionMode === 'mixed' && Math.random() > 0.4);

      let rawText: string;
      if (isRestaurant) {
        const restaurant = MOCK_RESTAURANTS[randomInt(0, MOCK_RESTAURANTS.length - 1)];
        rawText = restaurant.name;
      } else {
        const product = MOCK_PRODUCTS[randomInt(0, MOCK_PRODUCTS.length - 1)];
        rawText = product.name;
      }

      // Simulate slight OCR imperfections for realism
      const confidence = randomFloat(0.65, 0.98);

      // Generate non-overlapping bounding boxes
      const boxHeight = randomFloat(0.08, 0.15);
      const boxWidth = randomFloat(0.4, 0.7);
      const boxY = 0.15 + i * (boxHeight + 0.05);
      const boxX = randomFloat(0.1, 0.3);

      detections.push({
        id: generateId(),
        rawText,
        normalizedText: rawText.trim().replace(/\s+/g, ' '),
        confidence: Math.round(confidence * 100) / 100,
        boundingBox: {
          x: Math.round(boxX * 100) / 100,
          y: Math.round(boxY * 100) / 100,
          width: Math.round(boxWidth * 100) / 100,
          height: Math.round(boxHeight * 100) / 100,
        },
        language: 'en',
      });
    }

    // Sort by confidence (highest first)
    detections.sort((a, b) => b.confidence - a.confidence);

    const fullText = detections.map((d) => d.normalizedText).join('\n');

    return {
      success: true,
      detections,
      fullText,
      metadata: {
        provider: 'mock',
        processingTimeMs: Date.now() - startTime,
        timestamp: Date.now(),
        sourceImageUri: request.imageUri,
      },
    };
  }
}
