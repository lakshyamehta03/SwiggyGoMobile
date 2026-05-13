import { useCallback } from 'react';
import { router } from 'expo-router';

import { OCRServiceFactory } from '@/src/services/ocr';
import { getDetectionStrategy } from '@/src/config/detection-config';
import { useCameraRef } from '@/src/hooks/useCameraRef';
import { useDetection } from '@/src/store/detection-store';
import { useInstamart } from '@/src/store/instamart-store';
import { useAuth } from '@/src/store/auth-store';
import type { ScanningMode } from '@/src/types/detection';

export function useCapture(mode: ScanningMode) {
  const { state, setProcessing, setResults, setError } = useDetection();
  const { state: instamartState } = useInstamart();
  const { invalidateSession } = useAuth();
  const cameraRef = useCameraRef();

  const capture = useCallback(async () => {
    if (state.isProcessing) return;
    setProcessing(true);

    try {
      const uri =
        (await cameraRef.current?.takePicture()) ?? `mock://capture_${Date.now()}`;
      const ocrResponse = await OCRServiceFactory.create('mock').recognizeText({ imageUri: uri });

      const addressId = instamartState.selectedAddressId;
      if (!addressId) {
        setError('Please wait for addresses to load or select one.');
        return;
      }

      const processedResults = await getDetectionStrategy(mode).process(ocrResponse, { addressId });
      setResults(ocrResponse, processedResults, mode);

      if (ocrResponse.success && processedResults.length > 0) {
        router.push('/detection-results' as any);
      } else if (ocrResponse.success) {
        setError('No matching items found. Please try again.');
      }
    } catch (err: any) {
      if (err.statusCode === 401) {
        await invalidateSession();
      } else {
        setError(err instanceof Error ? err.message : 'Processing failed');
      }
    }
  }, [state.isProcessing, cameraRef, mode, instamartState.selectedAddressId,
    setProcessing, setResults, setError, invalidateSession]);

  return { capture };
}
