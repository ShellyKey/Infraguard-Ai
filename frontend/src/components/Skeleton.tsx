export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-2xl border border-gray-100 p-5 animate-pulse ${className}`}>
      <div className="h-4 bg-gray-100 rounded-lg w-1/3 mb-3" />
      <div className="h-8 bg-gray-100 rounded-lg w-1/2 mb-2" />
      <div className="h-3 bg-gray-50 rounded-lg w-2/3" />
    </div>
  );
}

export function SkeletonTable({ rows = 5 }: { rows?: number }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
      <div className="h-12 bg-gray-50" />
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="flex gap-4 px-4 py-3 border-t border-gray-50">
          <div className="h-6 bg-gray-100 rounded-full w-16" />
          <div className="h-4 bg-gray-100 rounded-lg w-20" />
          <div className="h-4 bg-gray-100 rounded-lg flex-1" />
          <div className="h-4 bg-gray-50 rounded-lg w-32" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonGauge({ size = 200 }: { size?: number }) {
  return (
    <div
      className="rounded-full bg-gray-100 animate-pulse"
      style={{ width: size, height: size }}
    />
  );
}
