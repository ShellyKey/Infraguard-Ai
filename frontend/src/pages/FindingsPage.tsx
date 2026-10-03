import { useMemo, useState } from 'react';
import { Card } from '../components/Card';
import { FindingsTable } from '../components/FindingsTable';
import { FindingDrawer } from '../components/FindingDrawer';
import { EmptyState } from '../components/EmptyError';
import type { ScanResult, Finding } from '../types';

export function FindingsPage() {
  const [selectedFinding, setSelectedFinding] = useState<Finding | null>(null);

  const result: ScanResult | null = useMemo(() => {
    const raw = sessionStorage.getItem('infraguard_scan_result');
    if (!raw) return null;
    try {
      return JSON.parse(raw) as ScanResult;
    } catch {
      return null;
    }
  }, []);

  if (!result) {
    return <EmptyState message="No scan results yet. Run a scan to see findings." />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Findings</h1>
        <p className="text-sm text-gray-500 mt-0.5">
          {result.findings.length} issues found across {new Set(result.findings.map((f) => f.file)).size} files
        </p>
      </div>

      {/* Severity summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {([
          { key: 'critical' as const, label: 'Critical', color: 'bg-red-500', bg: 'bg-red-50', text: 'text-red-700' },
          { key: 'high' as const, label: 'High', color: 'bg-orange-500', bg: 'bg-orange-50', text: 'text-orange-700' },
          { key: 'medium' as const, label: 'Medium', color: 'bg-amber-500', bg: 'bg-amber-50', text: 'text-amber-700' },
          { key: 'low' as const, label: 'Low', color: 'bg-blue-500', bg: 'bg-blue-50', text: 'text-blue-700' },
        ]).map(({ key, label, color, text }) => (
          <Card key={key} className="p-4 flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <div>
              <p className="text-xs font-medium text-gray-500">{label}</p>
              <p className={`text-xl font-bold ${text}`}>{result.summary[key]}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Findings Table */}
      <Card className="p-5">
        <FindingsTable
          findings={result.findings}
          onRowClick={(f) => setSelectedFinding(f)}
        />
      </Card>

      {/* Finding Detail Drawer */}
      <FindingDrawer
        finding={selectedFinding}
        allFindings={result.findings}
        onClose={() => setSelectedFinding(null)}
      />
    </div>
  );
}
