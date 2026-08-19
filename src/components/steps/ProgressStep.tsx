// ─────────────────────────────────────────────────────────────────────────────
// PROGRESS STEP — the animated "please wait" screen shown during AI analysis.
//
// It cycles through friendly status messages on a timer so the wait feels alive.
// It does NOT track real backend progress — it's a UX illusion (the AI call is a
// single request with no progress events). This is a common, honest pattern.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useEffect, useState } from 'react';
import { Loader2 } from 'lucide-react';

// Module-level constant (defined once, outside the component so it isn't recreated
// on every render). The messages we rotate through while waiting.
const PROGRESS_MESSAGES = [
  'Reading your CV...',
  'Analyzing the job description...',
  'Comparing your experience with the requirements...',
  'Checking for missing information...',
  'Preparing your tailored application...',
];

export function ProgressStep() {
  const [messageIndex, setMessageIndex] = useState(0); // Which message is currently shown

  // useEffect runs SIDE EFFECTS after render (timers, subscriptions, fetches).
  // The empty dependency array [] means "run once when mounted" (like a constructor).
  useEffect(() => {
    // setInterval ticks every 3.5s, advancing to the next message (but stopping at the last).
    const interval = setInterval(() => {
      setMessageIndex((prev) =>
        prev < PROGRESS_MESSAGES.length - 1 ? prev + 1 : prev
      );
    }, 3500);
    // The returned function is the CLEANUP — React calls it when the component unmounts,
    // clearing the timer so it doesn't leak or fire after the screen is gone.
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="py-16 flex flex-col items-center gap-6 animate-fade-up">
      <div className="relative">
        <div className="absolute inset-0 rounded-full bg-brand-gradient blur-xl opacity-40 animate-pulse" />
        <div className="relative w-16 h-16 rounded-2xl bg-brand-gradient flex items-center justify-center shadow-glow">
          <Loader2 className="w-7 h-7 text-white animate-spin" />
        </div>
      </div>

      <div className="text-center space-y-2 min-h-[3rem]">
        <p className="text-base font-medium text-zinc-700 transition-all duration-500">
          {PROGRESS_MESSAGES[messageIndex]}
        </p>
        <p className="text-xs text-zinc-400">This usually takes 20–40 seconds</p>
      </div>

      {/* Progress dots */}
      <div className="flex gap-1.5">
        {PROGRESS_MESSAGES.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${
              i <= messageIndex ? 'w-6 bg-brand-gradient' : 'w-1.5 bg-zinc-200'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
