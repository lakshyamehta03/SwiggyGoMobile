import React, { createContext, useReducer, useCallback, useMemo } from 'react';
import type { OCRDetection, OCRResponse } from '@/src/services/ocr';
import type { ProcessedResult, ScanningMode } from '@/src/types/detection';

// ─── State Shape ───────────────────────────────────────────────────────────────

export interface DetectionState {
  /** All detected items from the latest OCR run */
  results: OCRDetection[];
  /** Results after being enriched by a mode-specific strategy */
  processedResults: ProcessedResult[];
  /** The mode that was active during the last detection */
  activeMode: ScanningMode | null;
  /** Index of the currently selected result */
  selectedIndex: number;
  /** Whether an OCR operation is in progress */
  isProcessing: boolean;
  /** Full OCR response metadata */
  lastResponse: OCRResponse | null;
  /** Error message from the last failed operation */
  error: string | null;
}

const initialState: DetectionState = {
  results: [],
  processedResults: [],
  activeMode: null,
  selectedIndex: 0,
  isProcessing: false,
  lastResponse: null,
  error: null,
};

// ─── Actions ───────────────────────────────────────────────────────────────────

type DetectionAction =
  | { type: 'SET_PROCESSING'; payload: boolean }
  | { type: 'SET_RESULTS'; payload: { response: OCRResponse; processed: ProcessedResult[]; mode: ScanningMode } }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'SELECT_RESULT'; payload: number }
  | { type: 'CLEAR' };

function detectionReducer(state: DetectionState, action: DetectionAction): DetectionState {
  switch (action.type) {
    case 'SET_PROCESSING':
      return { ...state, isProcessing: action.payload, error: null };

    case 'SET_RESULTS':
      return {
        ...state,
        isProcessing: false,
        results: action.payload.response.detections,
        processedResults: action.payload.processed,
        activeMode: action.payload.mode,
        lastResponse: action.payload.response,
        selectedIndex: 0,
        error: action.payload.response.success ? null : (action.payload.response.error ?? 'Unknown error'),
      };

    case 'SET_ERROR':
      return { ...state, isProcessing: false, error: action.payload };

    case 'SELECT_RESULT':
      return {
        ...state,
        selectedIndex: Math.max(0, Math.min(action.payload, state.results.length - 1)),
      };

    case 'CLEAR':
      return initialState;

    default:
      return state;
  }
}

// ─── Context ───────────────────────────────────────────────────────────────────

interface DetectionContextValue {
  state: DetectionState;
  /** Start processing indicator */
  setProcessing: (processing: boolean) => void;
  /** Store OCR results and their processed/mode-specific versions */
  setResults: (response: OCRResponse, processed: ProcessedResult[], mode: ScanningMode) => void;
  /** Store an error message */
  setError: (error: string) => void;
  /** Select a specific detection result by index */
  selectResult: (index: number) => void;
  /** Clear all detection state */
  clear: () => void;
  /** Convenience: the currently selected detection (raw) */
  selectedResult: OCRDetection | null;
  /** Convenience: the currently selected processed result */
  selectedProcessedResult: ProcessedResult | null;
}

const DetectionContext = createContext<DetectionContextValue | null>(null);

// ─── Provider ──────────────────────────────────────────────────────────────────

export function DetectionProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(detectionReducer, initialState);

  const setProcessing = useCallback((processing: boolean) => {
    dispatch({ type: 'SET_PROCESSING', payload: processing });
  }, []);

  const setResults = useCallback((response: OCRResponse, processed: ProcessedResult[], mode: ScanningMode) => {
    dispatch({ type: 'SET_RESULTS', payload: { response, processed, mode } });
  }, []);

  const setError = useCallback((error: string) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  }, []);

  const selectResult = useCallback((index: number) => {
    dispatch({ type: 'SELECT_RESULT', payload: index });
  }, []);

  const clear = useCallback(() => {
    dispatch({ type: 'CLEAR' });
  }, []);

  const selectedResult = useMemo(
    () => state.results[state.selectedIndex] ?? null,
    [state.results, state.selectedIndex]
  );

  const selectedProcessedResult = useMemo(
    () => state.processedResults[state.selectedIndex] ?? null,
    [state.processedResults, state.selectedIndex]
  );

  const value = useMemo<DetectionContextValue>(
    () => ({
      state,
      setProcessing,
      setResults,
      setError,
      selectResult,
      clear,
      selectedResult,
      selectedProcessedResult,
    }),
    [state, setProcessing, setResults, setError, selectResult, clear, selectedResult, selectedProcessedResult]
  );

  return (
    <DetectionContext.Provider value={value}>
      {children}
    </DetectionContext.Provider>
  );
}

// ─── Hook ──────────────────────────────────────────────────────────────────────

export function useDetection(): DetectionContextValue {
  const context = React.useContext(DetectionContext);
  if (!context) {
    throw new Error('useDetection must be used within a DetectionProvider');
  }
  return context;
}
