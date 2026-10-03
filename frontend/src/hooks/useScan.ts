// ─── useScan Hook ──────────────────────────────────────────────
// Manages the full scan lifecycle: trigger → progress → result/error.

import { useState, useCallback } from 'react';
import type { ScanResult, ScanProgress } from '../types';
import { scanSampleProject } from '../api/client';
import { adaptScanResponse } from '../api/adapter';
import { mockScanResponse } from '../mock/data';

const useMock = import.meta.env.VITE_USE_MOCK === 'true';

const PHASES: ScanProgress[] = [
  { phase: 'scanning', message: 'Running security scanners…', percent: 20 },
  { phase: 'normalizing', message: 'Normalizing findings…', percent: 50 },
  { phase: 'analyzing', message: 'AI analysis in progress…', percent: 75 },
  { phase: 'complete', message: 'Scan complete!', percent: 100 },
];

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function useScan() {
  const [progress, setProgress] = useState<ScanProgress>({
    phase: 'idle',
    message: '',
    percent: 0,
  });
  const [result, setResult] = useState<ScanResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const startScan = useCallback(async () => {
    setError(null);
    setResult(null);

    try {
      if (useMock) {
        // Simulate progress phases with mock data
        for (const phase of PHASES) {
          setProgress(phase);
          await delay(800 + Math.random() * 600);
        }
        const adapted = adaptScanResponse(mockScanResponse);
        setResult(adapted);
      } else {
        // Real backend call with simulated progress
        setProgress(PHASES[0]!);
        const rawPromise = scanSampleProject();
        
        // Show progress phases while waiting
        setProgress(PHASES[1]!);
        await delay(500);
        setProgress(PHASES[2]!);
        
        const raw = await rawPromise;
        setProgress(PHASES[3]!);
        
        const adapted = adaptScanResponse(raw);
        setResult(adapted);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setProgress({ phase: 'error', message, percent: 0 });
      setError(message);
    }
  }, []);

  const reset = useCallback(() => {
    setProgress({ phase: 'idle', message: '', percent: 0 });
    setResult(null);
    setError(null);
  }, []);

  return { progress, result, error, startScan, reset };
}
