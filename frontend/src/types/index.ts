// ─── UI Model Types ────────────────────────────────────────────
// These types define the frontend's data model.
// The adapter (src/api/adapter.ts) maps the real backend JSON into these.

export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface SeveritySummary {
  critical: number;
  high: number;
  medium: number;
  low: number;
}

export interface Scores {
  security: number;
  compliance: number;
  reliability: number;
  cost: number;
  maintainability: number;
  performance: number;
  deployment_readiness: number;
  /** True when scores are computed client-side (not from backend) */
  estimated: boolean;
}

export interface AIAnalysis {
  explanation: string;
  risk: string;
  impact: string;
  recommendation: string;
  insecure_code?: string;
  fixed_code?: string;
}

export interface Finding {
  id: string;
  scanner: string;
  severity: Severity;
  title: string;
  file: string;
  line: number | null;
  resource: string;
  guideline?: string;
  ai: AIAnalysis;
  group_id: string;
}

export interface ScanResult {
  scan_id: string;
  created_at: string;
  summary: SeveritySummary;
  scores: Scores;
  findings: Finding[];
}

// ─── Backend response shape (raw) ──────────────────────────────

export interface BackendFinding {
  check_id: string;
  title: string;
  resource: string;
  severity: string;
  status: string;
  file: string;
  guideline: string;
  ai_analysis: {
    explanation: string;
    risk: string;
    impact: string;
    recommendation: string;
  };
}

export interface BackendScanResponse {
  status: string;
  message: string;
  total_findings: number;
  findings: BackendFinding[];
}

// ─── Scan Progress ─────────────────────────────────────────────

export type ScanPhase = 'idle' | 'uploading' | 'scanning' | 'normalizing' | 'analyzing' | 'complete' | 'error';

export interface ScanProgress {
  phase: ScanPhase;
  message: string;
  percent: number;
}
