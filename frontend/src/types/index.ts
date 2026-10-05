// ─── UI Model Types ────────────────────────────────────────────

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

// ─── Scan Progress ────────────────────────────────────────────

export type ScanPhase =
  | 'idle'
  | 'scanning'
  | 'normalizing'
  | 'analyzing'
  | 'complete'
  | 'error';

export interface ScanProgress {
  phase: ScanPhase;
  message: string;
  percent: number;
}

// ─── Backend Finding ──────────────────────────────────────────

export interface BackendFinding {
  check_id: string;
  title: string;
  resource: string;
  severity: string;
  status: string;
  file: string;
  guideline: string;

  // Current backend AI response
  ai?: {
    explanation: string;
    risk: string;
    impact: string;
    recommendation: string;
    insecure_code?: string;
    fixed_code?: string;
  };

  // Older backend AI response
  ai_analysis?: {
    explanation: string;
    risk: string;
    impact: string;
    recommendation: string;
    insecure_code?: string;
    fixed_code?: string;
  };

  // Current backend top-level fields
  explanation?: string;
  impact?: string;
  remediation?: string;
}

// ─── Backend Scan Response ───────────────────────────────────

export interface BackendScanResponse {
  status: string;
  message: string;
  total_findings: number;
  findings: BackendFinding[];

  summary?: SeveritySummary;
  scores?: Scores;
  scan_id?: string;
  created_at?: string;
}
