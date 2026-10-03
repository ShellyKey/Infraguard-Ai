import type { Severity } from '../types';

const SEVERITY_STYLES: Record<Severity, string> = {
  critical: 'bg-red-50 text-red-700 border-red-200',
  high: 'bg-orange-50 text-orange-700 border-orange-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  low: 'bg-blue-50 text-blue-700 border-blue-200',
};

interface BadgeProps {
  severity: Severity;
  className?: string;
}

export function Badge({ severity, className = '' }: BadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold
        border capitalize ${SEVERITY_STYLES[severity]} ${className}
      `}
    >
      {severity}
    </span>
  );
}

interface EstimatedBadgeProps {
  className?: string;
}

export function EstimatedBadge({ className = '' }: EstimatedBadgeProps) {
  return (
    <span
      className={`
        inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium
        bg-violet-50 text-violet-600 border border-violet-200 ${className}
      `}
    >
      estimated
    </span>
  );
}
