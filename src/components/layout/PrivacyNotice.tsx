// ─────────────────────────────────────────────────────────────────────────────
// PRIVACY NOTICE — a small reassurance banner shown on the input screen.
// Purely static markup; no props, no state.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { ShieldCheck } from 'lucide-react';

export function PrivacyNotice() {
  return (
    <div className="flex items-start gap-2.5 text-xs text-zinc-500 bg-white/60 border border-zinc-200/70 rounded-xl px-4 py-3 backdrop-blur">
      <ShieldCheck className="w-4 h-4 mt-0.5 shrink-0 text-emerald-500" />
      <p>
        <strong className="font-semibold text-zinc-700">Your privacy matters.</strong>{' '}
        {/* {' '} is a deliberate space: JSX collapses whitespace between lines,
            so this keeps a gap between the bold text and the sentence. */}
        No account required. Your CV and job details are processed only to generate your
        tailored application — they are not stored, logged, or shared.
      </p>
    </div>
  );
}
