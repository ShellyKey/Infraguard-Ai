import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { SeveritySummary } from '../types';

const COLORS: Record<string, string> = {
  critical: '#ef4444',
  high: '#f97316',
  medium: '#f59e0b',
  low: '#3b82f6',
};

interface SeverityDonutProps {
  summary: SeveritySummary;
  size?: number;
}

export function SeverityDonut({ summary, size = 220 }: SeverityDonutProps) {
  const data = [
    { name: 'Critical', value: summary.critical, color: COLORS.critical },
    { name: 'High', value: summary.high, color: COLORS.high },
    { name: 'Medium', value: summary.medium, color: COLORS.medium },
    { name: 'Low', value: summary.low, color: COLORS.low },
  ].filter((d) => d.value > 0);

  const total = summary.critical + summary.high + summary.medium + summary.low;

  return (
    <div className="flex flex-col items-center">
      <div style={{ width: size, height: size }} className="relative">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={size * 0.32}
              outerRadius={size * 0.44}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
              animationBegin={0}
              animationDuration={800}
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                borderRadius: '12px',
                border: '1px solid #e2e8f0',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '13px',
              }}
            />
          </PieChart>
        </ResponsiveContainer>
        {/* Center total */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-3xl font-bold text-gray-900">{total}</span>
          <span className="text-xs text-gray-500">Total Issues</span>
        </div>
      </div>
      {/* Legend */}
      <div className="flex flex-wrap gap-3 mt-3 justify-center">
        {data.map((d) => (
          <div key={d.name} className="flex items-center gap-1.5 text-xs text-gray-600">
            <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: d.color }} />
            {d.name} ({d.value})
          </div>
        ))}
      </div>
    </div>
  );
}
