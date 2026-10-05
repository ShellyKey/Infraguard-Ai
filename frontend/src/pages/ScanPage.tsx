import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FolderOpen,
  Shield,
  Loader2,
  CheckCircle,
  AlertCircle,
  Zap,
} from 'lucide-react';
import { useScan } from '../hooks/useScan';
import { useToast } from '../hooks/useToast';

type Phase =
  | 'idle'
  | 'uploading'
  | 'scanning'
  | 'normalizing'
  | 'analyzing'
  | 'complete'
  | 'error';

type StepState = 'done' | 'active' | 'pending';

type StepPhase =
  | 'scanning'
  | 'normalizing'
  | 'analyzing'
  | 'complete';

const PHASE_STEPS: {
  phase: StepPhase;
  label: string;
  icon: typeof Shield;
}[] = [
  {
    phase: 'scanning',
    label: 'Running Scanners',
    icon: Shield,
  },
  {
    phase: 'normalizing',
    label: 'Normalizing Results',
    icon: Zap,
  },
  {
    phase: 'analyzing',
    label: 'AI Analysis',
    icon: Loader2,
  },
  {
    phase: 'complete',
    label: 'Complete',
    icon: CheckCircle,
  },
];

function getStepState(
  currentPhase: Phase,
  stepPhase: StepPhase
): StepState {
  const phases: StepPhase[] = [
    'scanning',
    'normalizing',
    'analyzing',
    'complete',
  ];

  const currentIndex = phases.indexOf(
    currentPhase as StepPhase
  );

  const stepIndex = phases.indexOf(stepPhase);

  if (currentIndex === -1) {
    return 'pending';
  }

  if (stepIndex < currentIndex) {
    return 'done';
  }

  if (stepIndex === currentIndex) {
    return 'active';
  }

  return 'pending';
}

export function ScanPage() {
  const navigate = useNavigate();

  const {
    progress,
    result,
    error,
    startScan,
  } = useScan();

  const { addToast } = useToast();

  const fileInputRef =
    useRef<HTMLInputElement | null>(null);

  const [isDragOver, setIsDragOver] =
    useState(false);

  const isScanning = [
    'scanning',
    'normalizing',
    'analyzing',
  ].includes(progress.phase);

  const handleScanSample = useCallback(
    async () => {
      await startScan();
    },
    [startScan]
  );

  useEffect(() => {
    if (!result) {
      return;
    }

    const safeResult = {
      ...result,
      findings: Array.isArray(result.findings)
        ? result.findings
        : [],
    };

    sessionStorage.setItem(
      'infraguard_scan_result',
      JSON.stringify(safeResult)
    );

    addToast(
      'success',
      `Scan complete! Found ${safeResult.findings.length} findings.`
    );

    navigate('/dashboard');
  }, [result, navigate, addToast]);

  useEffect(() => {
    if (!error) {
      return;
    }

    addToast('error', error);
  }, [error, addToast]);

  return (
    <div className="max-w-3xl mx-auto">

      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-indigo-50 text-indigo-600 rounded-full text-sm font-medium mb-4">
          <Shield className="w-4 h-4" />
          Infrastructure Security Scanner
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Scan Your Infrastructure Code
        </h1>

        <p className="text-gray-500 text-base max-w-lg mx-auto">
          Upload your Terraform, Docker, or Kubernetes
          files for AI-powered security analysis and
          actionable remediation recommendations.
        </p>
      </div>

      {/* Scan Area */}
      {!isScanning &&
        progress.phase !== 'complete' && (
          <div className="space-y-4">

            {/* Upload Area */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragOver(true);
              }}
              onDragLeave={() => {
                setIsDragOver(false);
              }}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragOver(false);

                addToast(
                  'info',
                  'File upload will be available when the backend adds an upload endpoint. Use the sample project for now.'
                );
              }}
              onClick={() => {
                fileInputRef.current?.click();
              }}
              className={`
                relative border-2 border-dashed rounded-2xl
                p-12 text-center cursor-pointer
                transition-all duration-300
                ${
                  isDragOver
                    ? 'border-indigo-400 bg-indigo-50/50 scale-[1.01]'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/30 bg-white'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept=".tf,.yaml,.yml,.json,Dockerfile"
                className="hidden"
                onChange={() => {
                  addToast(
                    'info',
                    'File upload will be available when the backend adds an upload endpoint. Use the sample project for now.'
                  );
                }}
              />

              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
                <Upload
                  className={`w-7 h-7 text-indigo-500 ${
                    isDragOver ? 'scale-110' : ''
                  }`}
                />
              </div>

              <p className="text-base font-semibold text-gray-900 mb-1">
                Drag & drop your IaC files here
              </p>

              <p className="text-sm text-gray-500">
                Supports Terraform (.tf), Kubernetes
                (.yaml), Dockerfiles, and more
              </p>
            </div>

            {/* Divider */}
            <div className="flex items-center gap-4">
              <div className="flex-1 h-px bg-gray-200" />

              <span className="text-xs font-medium text-gray-400 uppercase">
                or
              </span>

              <div className="flex-1 h-px bg-gray-200" />
            </div>

            {/* Sample Project */}
            <button
              onClick={handleScanSample}
              className="
                w-full flex items-center gap-4 p-5
                bg-white border border-gray-200 rounded-2xl
                hover:border-indigo-300
                hover:bg-indigo-50/30
                transition-all duration-200
                group text-left
              "
            >
              <div
                className="
                  w-12 h-12 rounded-xl
                  bg-violet-50
                  flex items-center justify-center
                  group-hover:bg-violet-100
                  transition-colors shrink-0
                "
              >
                <FolderOpen className="w-6 h-6 text-violet-500" />
              </div>

              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900">
                  Use Sample Project
                </p>

                <p className="text-xs text-gray-500 mt-0.5">
                  Scan a pre-configured Terraform project
                  with intentional security issues
                  (S3 bucket, public access)
                </p>
              </div>

              <div
                className="
                  shrink-0 px-4 py-2
                  bg-indigo-500 text-white
                  text-sm font-semibold rounded-xl
                  group-hover:bg-indigo-600
                  transition-colors
                  shadow-lg shadow-indigo-500/20
                "
              >
                SCAN
              </div>
            </button>
          </div>
        )}

      {/* Progress */}
      {isScanning && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">

          <div className="flex items-center gap-3 mb-8">
            <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />

            <div>
              <p className="text-sm font-semibold text-gray-900">
                {progress.message}
              </p>

              <p className="text-xs text-gray-500 mt-0.5">
                This may take a moment…
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden mb-8">
            <div
              className="
                h-full
                bg-gradient-to-r
                from-indigo-500
                to-violet-500
                rounded-full
                transition-all
                duration-700
                ease-out
              "
              style={{
                width: `${progress.percent}%`,
              }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {PHASE_STEPS.map((step) => {
              const state = getStepState(
                progress.phase as Phase,
                step.phase
              );

              const Icon = step.icon;

              return (
                <div
                  key={step.phase}
                  className="flex items-center gap-3"
                >
                  <div
                    className={`
                      w-8 h-8 rounded-lg
                      flex items-center justify-center
                      transition-all
                      ${
                        state === 'done'
                          ? 'bg-green-50 text-green-500'
                          : state === 'active'
                          ? 'bg-indigo-50 text-indigo-500'
                          : 'bg-gray-50 text-gray-300'
                      }
                    `}
                  >
                    {state === 'done' ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : state === 'active' ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Icon className="w-4 h-4" />
                    )}
                  </div>

                  <span
                    className={`
                      text-sm font-medium
                      transition-colors
                      ${
                        state === 'done'
                          ? 'text-green-600'
                          : state === 'active'
                          ? 'text-indigo-600'
                          : 'text-gray-400'
                      }
                    `}
                  >
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Error */}
      {progress.phase === 'error' && (
        <div className="bg-white rounded-2xl border border-red-100 shadow-sm p-8 text-center">

          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-red-50 mb-4">
            <AlertCircle className="w-7 h-7 text-red-500" />
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            Scan Failed
          </h3>

          <p className="text-sm text-gray-500 mb-6">
            {error || 'An unknown error occurred.'}
          </p>

          <button
            onClick={handleScanSample}
            className="
              px-6 py-2.5
              bg-indigo-500 text-white
              text-sm font-semibold rounded-xl
              hover:bg-indigo-600
              transition-colors
              shadow-lg shadow-indigo-500/20
            "
          >
            Try Again
          </button>
        </div>
      )}
    </div>
  );
}