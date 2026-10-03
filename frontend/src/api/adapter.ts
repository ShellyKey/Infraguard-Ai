// ─── Adapter ───────────────────────────────────────────────────
// Converts the real backend JSON into our UI model (ScanResult).
// If the backend response shape changes, only this file updates.

import type {
  BackendScanResponse,
  BackendFinding,
  ScanResult,
  Finding,
  Severity,
  SeveritySummary,
  Scores,
  AIAnalysis,
} from '../types';

// ─── Known insecure / fixed code snippets for Checkov rules ───
const CODE_SNIPPETS: Record<string, { insecure: string; fixed: string }> = {
  CKV_AWS_53: {
    insecure: 'block_public_acls       = false',
    fixed: 'block_public_acls       = true',
  },
  CKV_AWS_54: {
    insecure: 'block_public_policy     = false',
    fixed: 'block_public_policy     = true',
  },
  CKV_AWS_55: {
    insecure: 'ignore_public_acls      = false',
    fixed: 'ignore_public_acls      = true',
  },
  CKV_AWS_56: {
    insecure: 'restrict_public_buckets = false',
    fixed: 'restrict_public_buckets = true',
  },
  CKV2_AWS_6: {
    insecure: `resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.example.id
  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}`,
    fixed: `resource "aws_s3_bucket_public_access_block" "example" {
  bucket = aws_s3_bucket.example.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}`,
  },
  CKV_AWS_145: {
    insecure: `resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
  # No server_side_encryption_configuration
}`,
    fixed: `resource "aws_s3_bucket_server_side_encryption_configuration" "example" {
  bucket = aws_s3_bucket.example.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.mykey.arn
    }
  }
}`,
  },
  CKV_AWS_21: {
    insecure: `resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
  # No versioning configuration
}`,
    fixed: `resource "aws_s3_bucket_versioning" "example" {
  bucket = aws_s3_bucket.example.id
  versioning_configuration {
    status = "Enabled"
  }
}`,
  },
  CKV_AWS_18: {
    insecure: `resource "aws_s3_bucket" "example" {
  bucket = "my-bucket"
  # No access logging
}`,
    fixed: `resource "aws_s3_bucket_logging" "example" {
  bucket        = aws_s3_bucket.example.id
  target_bucket = aws_s3_bucket.log_bucket.id
  target_prefix = "log/"
}`,
  },
  CKV_AWS_260: {
    insecure: `ingress {
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["0.0.0.0/0"]
}`,
    fixed: `ingress {
  from_port   = 22
  to_port     = 22
  protocol    = "tcp"
  cidr_blocks = ["10.0.0.0/8"]  # Restrict to trusted CIDR
}`,
  },
  CKV_DOCKER_3: {
    insecure: `FROM node:18
WORKDIR /app
COPY . .
RUN npm install
CMD ["node", "server.js"]
# Running as root by default`,
    fixed: `FROM node:18
WORKDIR /app
COPY . .
RUN npm install
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
USER appuser
CMD ["node", "server.js"]`,
  },
  CKV_DOCKER_2: {
    insecure: `FROM node:18
WORKDIR /app
CMD ["node", "server.js"]
# No HEALTHCHECK defined`,
    fixed: `FROM node:18
WORKDIR /app
CMD ["node", "server.js"]
HEALTHCHECK --interval=30s --timeout=3s \\
  CMD curl -f http://localhost:8080/health || exit 1`,
  },
  CKV_K8S_1: {
    insecure: `securityContext:
  privileged: true`,
    fixed: `securityContext:
  privileged: false
  runAsNonRoot: true
  readOnlyRootFilesystem: true`,
  },
  CKV_K8S_28: {
    insecure: `containers:
  - name: api-server
    image: myapp:latest
    # No resource limits defined`,
    fixed: `containers:
  - name: api-server
    image: myapp:latest
    resources:
      limits:
        cpu: "500m"
        memory: "256Mi"
      requests:
        cpu: "100m"
        memory: "128Mi"`,
  },
};

function mapSeverity(raw: string): Severity {
  const s = raw.toUpperCase();
  if (s === 'CRITICAL') return 'critical';
  if (s === 'HIGH') return 'high';
  if (s === 'MEDIUM') return 'medium';
  if (s === 'LOW') return 'low';
  // Checkov often returns "UNKNOWN" — map to medium as a safe default
  return 'medium';
}

function inferScanner(checkId: string): string {
  if (checkId.startsWith('CKV_DOCKER') || checkId.startsWith('CKV_DOCKER_')) return 'Trivy';
  if (checkId.startsWith('CKV_K8S')) return 'Trivy';
  if (checkId.startsWith('CKV2_AWS') || checkId.startsWith('CKV_AWS')) return 'Checkov';
  return 'Checkov';
}

function buildAI(bf: BackendFinding): AIAnalysis {
  const snippet = CODE_SNIPPETS[bf.check_id];
  return {
    explanation: bf.ai_analysis.explanation,
    risk: bf.ai_analysis.risk,
    impact: bf.ai_analysis.impact,
    recommendation: bf.ai_analysis.recommendation,
    insecure_code: snippet?.insecure,
    fixed_code: snippet?.fixed,
  };
}

function buildSummary(findings: Finding[]): SeveritySummary {
  return findings.reduce<SeveritySummary>(
    (acc, f) => {
      acc[f.severity]++;
      return acc;
    },
    { critical: 0, high: 0, medium: 0, low: 0 },
  );
}

/**
 * TODO: Replace with real backend scores when the API provides them.
 * Currently estimated from severity counts using weighted formula.
 * Weights: critical=10, high=6, medium=3, low=1.
 */
function computeEstimatedScores(summary: SeveritySummary): Scores {
  const totalPenalty =
    summary.critical * 10 +
    summary.high * 6 +
    summary.medium * 3 +
    summary.low * 1;

  // Base score degrades with more/worse findings
  const baseScore = Math.max(0, Math.min(100, 100 - totalPenalty * 1.5));

  // Distribute across categories with slight variation
  const security = Math.max(0, Math.round(baseScore - summary.critical * 5));
  const compliance = Math.max(0, Math.round(baseScore - summary.high * 3));
  const reliability = Math.max(0, Math.round(baseScore + 5));
  const cost = Math.max(0, Math.round(baseScore + 10));
  const maintainability = Math.max(0, Math.round(baseScore + 3));
  const performance = Math.max(0, Math.round(baseScore + 8));

  // Deployment readiness: weighted average
  const deployment_readiness = Math.round(
    security * 0.30 +
    compliance * 0.20 +
    reliability * 0.15 +
    cost * 0.10 +
    maintainability * 0.10 +
    performance * 0.15,
  );

  return {
    security: Math.min(security, 100),
    compliance: Math.min(compliance, 100),
    reliability: Math.min(reliability, 100),
    cost: Math.min(cost, 100),
    maintainability: Math.min(maintainability, 100),
    performance: Math.min(performance, 100),
    deployment_readiness: Math.min(deployment_readiness, 100),
    estimated: true,
  };
}

/**
 * Convert a raw backend response into our UI ScanResult model.
 */
export function adaptScanResponse(raw: BackendScanResponse): ScanResult {
  const findings: Finding[] = raw.findings.map((bf, idx) => ({
    id: `${bf.check_id}-${idx}`,
    scanner: inferScanner(bf.check_id),
    severity: mapSeverity(bf.severity),
    title: bf.title,
    file: bf.file,
    line: null, // Backend doesn't provide line numbers yet
    resource: bf.resource,
    guideline: bf.guideline || undefined,
    ai: buildAI(bf),
    group_id: bf.resource, // Group by resource since no explicit grouping
  }));

  const summary = buildSummary(findings);
  const scores = computeEstimatedScores(summary);

  return {
    scan_id: `scan-${Date.now()}`,
    created_at: new Date().toISOString(),
    summary,
    scores,
    findings,
  };
}
