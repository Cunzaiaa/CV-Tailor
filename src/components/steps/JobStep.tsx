// ─────────────────────────────────────────────────────────────────────────────
// JOB STEP — the "Step 2: Add the job" card.
//
// Two ways to provide the job ad:
//   1. Enter a URL → we fetch & scrape it server-side (/api/fetch-job).
//   2. Paste the description directly (fallback — many job sites block scraping).
//
// Like UploadStep, it reports the final job text up to the parent via `onJobReady`.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useState } from 'react';
import { Link, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface JobStepProps {
  onJobReady: (content: string) => void;
}

export function JobStep({ onJobReady }: JobStepProps) {
  const [url, setUrl] = useState('');              // The URL the user typed
  const [fetching, setFetching] = useState(false); // Spinner while scraping
  const [error, setError] = useState<string | null>(null);
  const [showPaste, setShowPaste] = useState(false); // Show the paste textarea?
  const [pastedJob, setPastedJob] = useState('');     // Text in the paste box
  const [fetchFailed, setFetchFailed] = useState(false); // Scraping failed → show fallback
  const [jobReady, setJobReady] = useState(false);       // We have usable job text

  // Try to fetch and scrape the job ad from the given URL.
  const handleFetchUrl = async () => {
    if (!url.trim()) {
      setError('Please enter a job advertisement URL.');
      return;
    }

    setFetching(true);
    setError(null);
    setFetchFailed(false);

    try {
      const res = await fetch('/api/fetch-job', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: url.trim() }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to fetch job advertisement.');
        setFetchFailed(true);
        return;
      }

      // The server may succeed at the request but still fail to extract useful text
      // (e.g. the site blocked it). In that case, ask the user to paste instead.
      if (data.fallbackRequired || !data.success) {
        setFetchFailed(true);
        setShowPaste(true);
        setError(null);
        return;
      }

      onJobReady(data.content); // Success — send the scraped text up to the parent
      setJobReady(true);
    } catch {
      setError('Network error. Please check your connection and try again.');
      setFetchFailed(true);
    } finally {
      setFetching(false);
    }
  };

  // The paste path: validate a minimum length, then hand the text to the parent.
  const handlePasteSubmit = () => {
    if (!pastedJob.trim() || pastedJob.trim().length < 50) {
      setError('Please paste the full job description.');
      return;
    }
    onJobReady(pastedJob.trim());
    setJobReady(true);
    setError(null);
  };

  // "Change" — clear the job so the user can enter a different one.
  const reset = () => {
    setJobReady(false);
    setFetchFailed(false);
    setShowPaste(false);
    setError(null);
    setPastedJob('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 shrink-0 rounded-lg bg-brand-gradient text-white text-xs font-bold flex items-center justify-center shadow-glow">
          2
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Add the job</h2>
          <p className="text-xs text-zinc-400">Paste the job URL or the description directly</p>
        </div>
      </div>

      {/* If we have the job → show a compact "Ready" chip; else → show the inputs. */}
      {jobReady ? (
        <div className="flex items-center gap-3 border border-violet-100 rounded-xl px-4 py-3 bg-violet-50/60">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0 shadow-glow">
            <Link className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-700 truncate">
              {url || 'Job description added'}
            </p>
            <p className="text-xs text-violet-500 font-medium">Ready</p>
          </div>
          <button
            onClick={reset}
            className="text-xs text-zinc-400 hover:text-violet-600 transition-colors underline underline-offset-2"
          >
            Change
          </button>
        </div>
      ) : (
        <>
          {/* URL input */}
          <div className="flex gap-2">
            <div className="flex-1 relative">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setError(null);
                }}
                onKeyDown={(e) => e.key === 'Enter' && handleFetchUrl()}
                placeholder="https://company.com/jobs/..."
                aria-label="Job advertisement URL"
                className="w-full border border-zinc-200 rounded-lg px-4 py-2.5 text-sm text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 transition-shadow"
              />
            </div>
            <button
              onClick={handleFetchUrl}
              disabled={fetching || !url.trim()}
              className="bg-brand-gradient text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-glow hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200 whitespace-nowrap"
            >
              {fetching ? 'Fetching...' : 'Fetch'}
            </button>
          </div>

          {/* Fallback notice after failed fetch */}
          {fetchFailed && (
            <div className="rounded-xl border border-amber-100 bg-amber-50 px-4 py-3 text-xs text-amber-700">
              <p className="font-medium mb-1">
                We couldn&apos;t read this job advertisement automatically.
              </p>
              <p>
                Some job sites block automated access. Please paste the job description below
                — the analysis will work just as well.
              </p>
            </div>
          )}

          {/* Paste fallback toggle */}
          <button
            onClick={() => setShowPaste(!showPaste)}
            className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-violet-600 transition-colors"
          >
            {showPaste ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
            <span>{showPaste ? 'Hide' : 'Or paste the job description'}</span>
          </button>

          {showPaste && (
            <div className="space-y-3">
              <textarea
                value={pastedJob}
                onChange={(e) => {
                  setPastedJob(e.target.value);
                  setError(null);
                }}
                placeholder="Paste the full job advertisement here..."
                rows={8}
                aria-label="Job description"
                className={cn(
                  'w-full border rounded-xl px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-300',
                  'focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 resize-none transition-shadow',
                  'border-zinc-200'
                )}
              />
              <button
                onClick={handlePasteSubmit}
                disabled={!pastedJob.trim()}
                className="w-full bg-brand-gradient text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-glow hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
              >
                Use this description
              </button>
            </div>
          )}
        </>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
