import { useEffect, useState } from 'react';

interface ScoreGaugeProps {
  value: number;
  size?: number;
  label?: string;
  showStatus?: boolean;
}

function getStatus(value: number): { text: string; color: string } {
  if (value >= 80) return { text: 'Ready', color: '#22c55e' };
  if (value >= 50) return { text: 'Needs Work', color: '#f59e0b' };
  return { text: 'Not Ready', color: '#ef4444' };
}

function getStrokeColor(value: number): string {
  if (value >= 80) return '#22c55e';
  if (value >= 60) return '#84cc16';
  if (value >= 40) return '#f59e0b';
  if (value >= 20) return '#f97316';
  return '#ef4444';
}

export function ScoreGauge({ value, size = 200, label, showStatus = true }: ScoreGaugeProps) {
  const [animated, setAnimated] = useState(0);
  const strokeWidth = size * 0.08;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const status = getStatus(value);

  useEffect(() => {
    const timer = setTimeout(() => setAnimated(value), 100);
    return () => clearTimeout(timer);
  }, [value]);

  const offset = circumference - (animated / 100) * circumference;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke={getStrokeColor(animated)}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        {/* Center text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-4xl font-bold text-gray-900">{animated}</span>
          {label && <span className="text-xs text-gray-500 mt-0.5">{label}</span>}
        </div>
      </div>
      {showStatus && (
        <span
          className="text-sm font-semibold px-3 py-1 rounded-full"
          style={{ color: status.color, backgroundColor: `${status.color}15` }}
        >
          {status.text}
        </span>
      )}
    </div>
  );
}
