import { useState, useMemo, useCallback } from 'react';
import { Search, ChevronDown, ChevronUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from './Badge';
import type { Finding, Severity } from '../types';

const PAGE_SIZE = 10;

interface FindingsTableProps {
  findings: Finding[];
  onRowClick: (finding: Finding) => void;
}

type SortField = 'severity' | 'scanner' | 'title' | 'file';
type SortDir = 'asc' | 'desc';

const SEVERITY_ORDER: Record<Severity, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

export function FindingsTable({ findings, onRowClick }: FindingsTableProps) {
  const [search, setSearch] = useState('');
  const [severityFilter, setSeverityFilter] = useState<Severity | 'all'>('all');
  const [scannerFilter, setScannerFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('severity');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(0);

  const scanners = useMemo(
    () => ['all', ...new Set(findings.map((f) => f.scanner))],
    [findings],
  );

  const toggleSort = useCallback(
    (field: SortField) => {
      if (sortField === field) {
        setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortField(field);
        setSortDir('asc');
      }
      setPage(0);
    },
    [sortField],
  );

  const filtered = useMemo(() => {
    let data = [...findings];

    // Search
    if (search) {
      const q = search.toLowerCase();
      data = data.filter(
        (f) =>
          f.title.toLowerCase().includes(q) ||
          f.file.toLowerCase().includes(q) ||
          f.resource.toLowerCase().includes(q) ||
          f.scanner.toLowerCase().includes(q),
      );
    }

    // Severity filter
    if (severityFilter !== 'all') {
      data = data.filter((f) => f.severity === severityFilter);
    }

    // Scanner filter
    if (scannerFilter !== 'all') {
      data = data.filter((f) => f.scanner === scannerFilter);
    }

    // Sort
    data.sort((a, b) => {
      let cmp = 0;
      if (sortField === 'severity') {
        cmp = SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity];
      } else if (sortField === 'scanner') {
        cmp = a.scanner.localeCompare(b.scanner);
      } else if (sortField === 'title') {
        cmp = a.title.localeCompare(b.title);
      } else if (sortField === 'file') {
        cmp = a.file.localeCompare(b.file);
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

    return data;
  }, [findings, search, severityFilter, scannerFilter, sortField, sortDir]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paged = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return <ChevronDown className="w-3.5 h-3.5 text-gray-300" />;
    return sortDir === 'asc' ? (
      <ChevronUp className="w-3.5 h-3.5 text-indigo-500" />
    ) : (
      <ChevronDown className="w-3.5 h-3.5 text-indigo-500" />
    );
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search findings…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(0);
            }}
            className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                       focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                       transition-colors placeholder:text-gray-400"
          />
        </div>
        {/* Severity filter */}
        <select
          value={severityFilter}
          onChange={(e) => {
            setSeverityFilter(e.target.value as Severity | 'all');
            setPage(0);
          }}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                     transition-colors cursor-pointer"
        >
          <option value="all">All Severities</option>
          <option value="critical">Critical</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        {/* Scanner filter */}
        <select
          value={scannerFilter}
          onChange={(e) => {
            setScannerFilter(e.target.value);
            setPage(0);
          }}
          className="px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm
                     focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400
                     transition-colors cursor-pointer"
        >
          {scanners.map((s) => (
            <option key={s} value={s}>
              {s === 'all' ? 'All Scanners' : s}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-2xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50/80">
              {([
                ['severity', 'Severity'],
                ['scanner', 'Scanner'],
                ['title', 'Title'],
                ['file', 'File'],
              ] as const).map(([field, label]) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider
                             cursor-pointer hover:text-gray-700 transition-colors select-none"
                >
                  <span className="inline-flex items-center gap-1">
                    {label}
                    <SortIcon field={field} />
                  </span>
                </th>
              ))}
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                Resource
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {paged.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-gray-400">
                  No findings match your filters.
                </td>
              </tr>
            ) : (
              paged.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => onRowClick(f)}
                  className="hover:bg-indigo-50/40 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3">
                    <Badge severity={f.severity} />
                  </td>
                  <td className="px-4 py-3 text-gray-600 font-medium">{f.scanner}</td>
                  <td className="px-4 py-3 text-gray-900 font-medium max-w-xs truncate">
                    {f.title}
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-mono text-xs">
                    {f.file}
                    {f.line != null && `:${f.line}`}
                  </td>
                  <td className="px-4 py-3 text-gray-500 text-xs max-w-[200px] truncate">
                    {f.resource}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-1">
          <span className="text-xs text-gray-500">
            Showing {page * PAGE_SIZE + 1}–{Math.min((page + 1) * PAGE_SIZE, filtered.length)} of{' '}
            {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => setPage(i)}
                className={`w-8 h-8 rounded-lg text-xs font-medium transition-colors ${
                  i === page
                    ? 'bg-indigo-500 text-white'
                    : 'hover:bg-gray-100 text-gray-600'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={page === totalPages - 1}
              className="p-1.5 rounded-lg hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
