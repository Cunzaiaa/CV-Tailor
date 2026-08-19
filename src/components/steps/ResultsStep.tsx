// ─────────────────────────────────────────────────────────────────────────────
// RESULTS STEP — the final screen showing the tailored application.
//
// It displays the match score/analysis, then a two-tab view (CV / Cover Letter).
// It delegates the heavy rendering to child components (MatchScore, CVTab,
// CoverLetterTab) and just manages which tab is active + the "Start over" button.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useState } from 'react';
import type { FinalOutput } from '@/types';
import { MatchScore } from '@/components/results/MatchScore';
import { CVTab } from '@/components/results/CVTab';
import { CoverLetterTab } from '@/components/results/CoverLetterTab';
import { RotateCcw } from 'lucide-react';

interface ResultsStepProps {
  output: FinalOutput;   // The full AI result (analysis + CV + cover letter)
  onReset: () => void;   // Called by "Start over" to reset the whole app
}

// A local union type for the two tabs. Keeps `activeTab` restricted to valid values.
type Tab = 'cv' | 'coverletter';

export function ResultsStep({ output, onReset }: ResultsStepProps) {
  const [activeTab, setActiveTab] = useState<Tab>('cv'); // Which tab is showing

  // Build a nice heading like "Backend Engineer at Acme", gracefully handling
  // any missing pieces. `a && b ? ... : a || b || fallback` chains the fallbacks.
  const title =
    output.jobTitle && output.company
      ? `${output.jobTitle} at ${output.company}`
      : output.jobTitle || output.company || 'Target Role';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs text-zinc-400 font-medium uppercase tracking-wider mb-1">
            Application ready
          </p>
          <h2 className="text-xl font-semibold text-zinc-900 leading-tight">{title}</h2>
          {output.candidateName && (
            <p className="text-sm text-zinc-500 mt-0.5">{output.candidateName}</p>
          )}
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-600 transition-colors shrink-0 mt-1"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          Start over
        </button>
      </div>

      {/* Match Score + Analysis */}
      <MatchScore analysis={output.analysis} />

      {/* Tabs */}
      <div>
        <div className="flex border-b border-zinc-100 mb-6">
          {(['cv', 'coverletter'] as Tab[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab
                  ? 'border-zinc-900 text-zinc-900'
                  : 'border-transparent text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {tab === 'cv' ? 'Tailored CV' : 'Cover Letter'}
            </button>
          ))}
        </div>

        {activeTab === 'cv' ? (
          <CVTab
            tailoredCV={output.tailoredCV}
            candidateName={output.candidateName}
            jobTitle={output.jobTitle}
            company={output.company}
          />
        ) : (
          <CoverLetterTab
            coverLetter={output.coverLetter}
            candidateName={output.candidateName}
            jobTitle={output.jobTitle}
            company={output.company}
          />
        )}
      </div>
    </div>
  );
}
