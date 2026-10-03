import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import {
  Shield, Scale, Server, DollarSign, Wrench, Gauge, FileWarning,
} from 'lucide-react';
import { Card } from '../components/Card';
import { EstimatedBadge } from '../components/Badge';
import { ScoreGauge } from '../components/ScoreGauge';
import { SeverityDonut } from '../components/SeverityDonut';
import { EmptyState } from '../components/EmptyError';
import type { ScanResult } from '../types';

const SCORE_CARDS = [
  { key: 'security' as const, label: 'Security', icon: Shield, color: '#6366f1' },
  { key: 'compliance' as const, label: 'Compliance', icon: Scale, color: '#8b5cf6' },
  { key: 'reliability' as const, label: 'Reliability', icon: Server, color: '#06b6d4' },
  { key: 'cost' as const, label: 'Cost', icon: DollarSign, color: '#10b981' },
  { key: 'maintainability' as const, label: 'Maintainability', icon: Wrench, color: '#f59e0b' },
  { key: 'performance' as const, label: 'Performance', icon: Gauge, color: '#ec4899' },
];

function getScoreColor(value: number): string {
  if (value >= 80) return '#22c55e';
  if (value >= 60) return '#84cc16';
  if (value >= 40) return '#f59e0b';
  if (value >= 20) return '#f97316';
  return '#ef4444';
}

export function DashboardPage() {
  const navigate = useNavigate();

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
    return (
      <EmptyState message="No scan results yet. Run a scan to see your dashboard." />
    );
  }

  const { scores, summary, findings } = result;

  // Findings by scanner
  const scannerData = useMemo(() => {
    const map = new Map<string, number>();
    findings.forEach((f) => map.set(f.scanner, (map.get(f.scanner) ?? 0) + 1));
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [findings]);

  // Top risky files
  const riskyFiles = useMemo(() => {
    const map = new Map<string, { critical: number; high: number; total: number }>();
    findings.forEach((f) => {
      const entry = map.get(f.file) ?? { critical: 0, high: 0, total: 0 };
      if (f.severity === 'critical') entry.critical++;
      if (f.severity === 'high') entry.high++;
      entry.total++;
      map.set(f.file, entry);
    });
    return Array.from(map.entries())
      .map(([file, data]) => ({ file, ...data }))
      .sort((a, b) => b.critical * 10 + b.high * 5 + b.total - (a.critical * 10 + a.high * 5 + a.total))
      .slice(0, 5);
  }, [findings]);

  const SCANNER_COLORS = ['#6366f1', '#8b5cf6', '#06b6d4', '#ec4899'];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Security Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Scan completed at {new Date(result.created_at).toLocaleString()}
          </p>
        </div>
        {scores.estimated && <EstimatedBadge />}
      </div>

      {/* Top Row: Gauge + Severity + Score Cards */}
      <div className="grid grid-cols-12 gap-5">
        {/* Deployment Readiness Gauge */}
        <Card className="col-span-12 lg:col-span-3 p-6 flex flex-col items-center justify-center">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Deployment Readiness</h3>
          <ScoreGauge value={scores.deployment_readiness} label="/100" />
        </Card>

        {/* Severity Donut */}
        <Card className="col-span-12 sm:col-span-6 lg:col-span-3 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Severity Breakdown</h3>
          <SeverityDonut summary={summary} size={180} />
        </Card>

        {/* Score Cards Grid */}
        <div className="col-span-12 lg:col-span-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {SCORE_CARDS.map(({ key, label, icon: Icon, color }) => (
            <Card key={key} className="p-4" hover>
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${color}15` }}
                >
                  <Icon className="w-4 h-4" style={{ color }} />
                </div>
                <span className="text-xs font-semibold text-gray-500">{label}</span>
              </div>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-2xl font-bold text-gray-900">{scores[key]}</span>
                <span className="text-xs text-gray-400 mb-1">/100</span>
              </div>
              {/* Progress bar */}
              <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{
                    width: `${scores[key]}%`,
                    backgroundColor: getScoreColor(scores[key]),
                  }}
                />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Bottom Row: Bar Chart + Risky Files */}
      <div className="grid grid-cols-12 gap-5">
        {/* Findings by Scanner */}
        <Card className="col-span-12 lg:col-span-7 p-6">
          <h3 className="text-sm font-semibold text-gray-500 mb-4">Findings by Scanner</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={scannerData} barSize={48}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    borderRadius: '12px',
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                    fontSize: '13px',
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {scannerData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={SCANNER_COLORS[index % SCANNER_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Top Risky Files */}
        <Card className="col-span-12 lg:col-span-5 p-6">
          <div className="flex items-center gap-2 mb-4">
            <FileWarning className="w-4 h-4 text-orange-500" />
            <h3 className="text-sm font-semibold text-gray-500">Top Risky Files</h3>
          </div>
          <div className="space-y-3">
            {riskyFiles.map((rf) => (
              <div
                key={rf.file}
                onClick={() => navigate('/findings')}
                className="flex items-center gap-3 p-3 rounded-xl bg-gray-50/80 hover:bg-indigo-50/40
                           cursor-pointer transition-colors border border-transparent hover:border-indigo-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 font-mono truncate">{rf.file}</p>
                  <div className="flex gap-3 mt-1">
                    {rf.critical > 0 && (
                      <span className="text-xs text-red-600 font-medium">{rf.critical} critical</span>
                    )}
                    {rf.high > 0 && (
                      <span className="text-xs text-orange-600 font-medium">{rf.high} high</span>
                    )}
                    <span className="text-xs text-gray-400">{rf.total} total</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
