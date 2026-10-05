import { useState } from 'react';
import {
  X,
  Copy,
  Check,
  AlertTriangle,
  Lightbulb,
  ShieldAlert,
  Wrench,
  Link,
} from 'lucide-react';
import { Badge } from './Badge';
import type { Finding } from '../types';

interface FindingDrawerProps {
  finding: Finding | null;
  allFindings: Finding[];
  onClose: () => void;
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);

    setTimeout(() => {
      setCopied(false);
    }, 2000);
  };

  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/80 hover:bg-white
                 border border-gray-200 transition-all text-gray-500 hover:text-gray-700"
      title="Copy to clipboard"
    >
      {copied ? (
        <Check className="w-3.5 h-3.5 text-green-500" />
      ) : (
        <Copy className="w-3.5 h-3.5" />
      )}
    </button>
  );
}

export function FindingDrawer({
  finding,
  allFindings,
  onClose,
}: FindingDrawerProps) {
  if (!finding) return null;

  const relatedFindings = allFindings.filter(
    (f) => f.group_id === finding.group_id && f.id !== finding.id,
  );

  // AI analysis may not exist for every finding yet.
  const ai = finding.ai;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className="fixed right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl z-50
                   transform transition-transform duration-300 overflow-y-auto"
      >
        {/* Header */}
        <div
          className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100
                     px-6 py-4 flex items-start justify-between"
        >
          <div className="flex-1 min-w-0 pr-4">
            <div className="flex items-center gap-2 mb-1">
              <Badge severity={finding.severity} />
              <span className="text-xs font-medium text-gray-400">
                {finding.scanner}
              </span>
            </div>

            <h2 className="text-lg font-semibold text-gray-900 leading-snug">
              {finding.title}
            </h2>

            <p className="text-xs text-gray-500 font-mono mt-1">
              {finding.file}
              {finding.line != null && `:${finding.line}`}
              <span className="mx-2 text-gray-300">·</span>
              {finding.resource}
            </p>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-gray-100 transition-colors
                       text-gray-400 hover:text-gray-600"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">

          {/* Explanation */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Lightbulb className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                Explanation
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {ai?.explanation ||
                'AI explanation is not available for this finding yet.'}
            </p>
          </section>

          {/* Risk */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <ShieldAlert className="w-4 h-4 text-red-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                Risk
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {ai?.risk ||
                'AI risk analysis is not available for this finding yet.'}
            </p>
          </section>

          {/* Impact */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="w-4 h-4 text-orange-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                Impact
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {ai?.impact ||
                'AI impact analysis is not available for this finding yet.'}
            </p>
          </section>

          {/* Recommendation */}
          <section>
            <div className="flex items-center gap-2 mb-2">
              <Wrench className="w-4 h-4 text-indigo-500" />
              <h3 className="text-sm font-semibold text-gray-700">
                Recommended Fix
              </h3>
            </div>

            <p className="text-sm text-gray-600 leading-relaxed">
              {ai?.recommendation ||
                'AI recommendation is not available for this finding yet.'}
            </p>
          </section>

          {/* Code Comparison */}
          {(ai?.insecure_code || ai?.fixed_code) && (
            <section>
              <h3 className="text-sm font-semibold text-gray-700 mb-3">
                Code Comparison
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">

                {/* Insecure Code */}
                {ai?.insecure_code && (
                  <div className="relative">
                    <div
                      className="text-xs font-semibold text-red-600 mb-1.5
                                 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-red-400" />
                      Insecure
                    </div>

                    <div
                      className="relative bg-red-50/50 border border-red-200/50
                                 rounded-xl p-3 overflow-x-auto"
                    >
                      <pre
                        className="text-xs text-red-900 font-mono
                                   whitespace-pre leading-relaxed"
                      >
                        {ai.insecure_code}
                      </pre>

                      <CopyButton text={ai.insecure_code} />
                    </div>
                  </div>
                )}

                {/* Fixed Code */}
                {ai?.fixed_code && (
                  <div className="relative">
                    <div
                      className="text-xs font-semibold text-green-600 mb-1.5
                                 flex items-center gap-1.5"
                    >
                      <span className="w-2 h-2 rounded-full bg-green-400" />
                      Recommended
                    </div>

                    <div
                      className="relative bg-green-50/50 border border-green-200/50
                                 rounded-xl p-3 overflow-x-auto"
                    >
                      <pre
                        className="text-xs text-green-900 font-mono
                                   whitespace-pre leading-relaxed"
                      >
                        {ai.fixed_code}
                      </pre>

                      <CopyButton text={ai.fixed_code} />
                    </div>
                  </div>
                )}

              </div>
            </section>
          )}

          {/* Related Findings */}
          {relatedFindings.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <Link className="w-4 h-4 text-violet-500" />

                <h3 className="text-sm font-semibold text-gray-700">
                  Related Findings ({relatedFindings.length})
                </h3>
              </div>

              <div className="space-y-2">
                {relatedFindings.map((rf) => (
                  <div
                    key={rf.id}
                    className="flex items-center gap-3 p-3 rounded-xl
                               bg-gray-50 border border-gray-100
                               hover:bg-indigo-50/40 transition-colors"
                  >
                    <Badge severity={rf.severity} />

                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-800 truncate">
                        {rf.title}
                      </p>

                      <p className="text-xs text-gray-500">
                        {rf.scanner}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Guideline Link */}
          {finding.guideline && (
            <a
              href={finding.guideline}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-sm text-indigo-500
                         hover:text-indigo-700 transition-colors"
            >
              <Link className="w-3.5 h-3.5" />
              View Checkov guideline
            </a>
          )}

        </div>
      </div>
    </>
  );
}
