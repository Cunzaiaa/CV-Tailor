// ─────────────────────────────────────────────────────────────────────────────
// MATCH SCORE — the colored card summarizing how well the CV fits the job.
//
// Shows a percentage, a progress bar, and three bullet lists (strengths, gaps,
// recommendations). The color (green/amber/red) is derived from the score.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import type { AnalysisResult } from '@/types';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';

interface MatchScoreProps {
  analysis: AnalysisResult;
}

export function MatchScore({ analysis }: MatchScoreProps) {
  // Destructure the four fields we need out of the analysis object.
  const { matchScore, strengths, gaps, importantNotes } = analysis;

  // Pick a text color band based on the score. Nested ternaries read as:
  // ≥75 → green, else ≥50 → amber, else → red.
  const scoreColor =
    matchScore >= 75
      ? 'text-emerald-700'
      : matchScore >= 50
      ? 'text-amber-700'
      : 'text-red-600';

  // Matching color for the progress bar fill.
  const trackColor =
    matchScore >= 75
      ? 'bg-emerald-500'
      : matchScore >= 50
      ? 'bg-amber-400'
      : 'bg-red-400';

  // And for the card's background/border.
  const bgColor =
    matchScore >= 75
      ? 'bg-emerald-50 border-emerald-100'
      : matchScore >= 50
      ? 'bg-amber-50 border-amber-100'
      : 'bg-red-50 border-red-100';

  return (
    <div className={`rounded-xl border ${bgColor} p-5 space-y-5`}>
      {/* Score header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-0.5">
            Application alignment
          </p>
          <p className="text-xs text-zinc-400">
            Based on available information — not a guarantee of interview success.
          </p>
        </div>
        <div className={`text-4xl font-bold tabular-nums ${scoreColor}`}>
          {matchScore}%
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-2 bg-white/70 rounded-full overflow-hidden border border-white">
        <div
          className={`h-full ${trackColor} rounded-full transition-all duration-1000`}
          style={{ width: `${matchScore}%` }}
        />
      </div>

      {/* Strengths */}
      {strengths.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
            <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            Strengths
          </p>
          <ul className="space-y-1">
            {strengths.map((s, i) => (
              <li key={i} className="text-xs text-zinc-600 pl-5">
                {s}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Gaps */}
      {gaps.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500" />
            Areas to address
          </p>
          <ul className="space-y-1">
            {gaps.map((g, i) => (
              <li key={i} className="text-xs text-zinc-600 pl-5">
                {g}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Important notes */}
      {importantNotes.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-zinc-600 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-blue-400" />
            Recommendations
          </p>
          <ul className="space-y-1">
            {importantNotes.map((n, i) => (
              <li key={i} className="text-xs text-zinc-600 pl-5">
                {n}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
