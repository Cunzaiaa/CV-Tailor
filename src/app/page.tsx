// ─────────────────────────────────────────────────────────────────────────────
// HOME PAGE — the main screen and "brain" of the whole app.
//
// This single component orchestrates the entire user journey using a small state
// machine (`step`): input → progress → questions → results. It owns all the shared
// data (CV text, job text, results) and passes callbacks down to child components.
//
// 'use client' marks this as a CLIENT component: it runs in the browser and can use
// React hooks (useState), event handlers, and fetch. Without it, Next would treat
// this as a server component (no interactivity). Rule of thumb: anything with
// buttons, inputs, or useState needs 'use client'.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useState, useCallback } from 'react';
// Child components — each owns one piece of the UI (like small Spring @Components).
import { Header } from '@/components/layout/Header';
import { PrivacyNotice } from '@/components/layout/PrivacyNotice';
import { UploadStep } from '@/components/steps/UploadStep';
import { JobStep } from '@/components/steps/JobStep';
import { ProgressStep } from '@/components/steps/ProgressStep';
import { QuestionsStep } from '@/components/steps/QuestionsStep';
import { ResultsStep } from '@/components/steps/ResultsStep';
// `import type` pulls in TypeScript types only (erased at build time — zero runtime cost).
import type {
  AppStep,
  UserAnswer,
  FinalOutput,
  MatchQuestion,
  ParsedCV,
  ParsedJob,
} from '@/types';
import { AlertCircle, ArrowRight, Sparkles } from 'lucide-react'; // Icon components

// `export default` = the component Next renders for the "/" route (file = route in App Router).
export default function Home() {
  // ── State ──────────────────────────────────────────────────────────────────
  // useState returns [currentValue, setterFn]. Calling the setter re-renders the UI.
  // This is React's version of "fields on a controller" — but changing them
  // automatically repaints the screen (no manual DOM updates).

  const [step, setStep] = useState<AppStep>('input'); // Which screen is showing (the state machine)
  const [cvText, setCvText] = useState('');           // Extracted plain text of the user's CV
  const [cvFileName, setCvFileName] = useState('');    // Original file name (for display)
  const [jobContent, setJobContent] = useState('');    // Job ad text (pasted or fetched from URL)
  const [error, setError] = useState<string | null>(null); // Any error message to show the user

  // Questions flow — populated only if the AI needs clarification before tailoring.
  const [questions, setQuestions] = useState<MatchQuestion[]>([]);
  const [parsedCVState, setParsedCVState] = useState<ParsedCV | null>(null);   // Cached parsed CV
  const [parsedJobState, setParsedJobState] = useState<ParsedJob | null>(null); // Cached parsed job

  // Final result — the tailored CV + cover letter, shown on the results screen.
  const [finalOutput, setFinalOutput] = useState<FinalOutput | null>(null);

  // ── Handlers ───────────────────────────────────────────────────────────────
  // useCallback memoizes a function so it keeps the SAME identity between renders
  // (unless its dependencies change). This prevents child components from
  // re-rendering unnecessarily. The [] means "never recreate this function".

  // Called by UploadStep once the CV file has been parsed to text.
  const handleCVReady = useCallback((text: string, fileName: string) => {
    setCvText(text);
    setCvFileName(fileName);
  }, []);

  // Called by JobStep once we have the job description text.
  const handleJobReady = useCallback((content: string) => {
    setJobContent(content);
  }, []);

  // The core action: send CV + job (+ any answers) to our backend API and route
  // the response to the right screen. This is the client half of the request.
  const runAnalysis = useCallback(
    async (userAnswers: UserAnswer[] = []) => {
      setStep('progress'); // Immediately show the loading screen
      setError(null);      // Clear any previous error

      try {
        // fetch() is the browser's built-in HTTP client (like RestTemplate/HttpClient).
        // We POST JSON to our own Next API route at /api/analyze.
        const res = await fetch('/api/analyze', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ cvText, jobContent, userAnswers }),
        });

        const data = await res.json(); // Parse the JSON body of the response

        // res.ok is true for 2xx status codes. If not, show the server's error.
        if (!res.ok) {
          setError(data.error ?? 'Analysis failed. Please try again.');
          setStep('input');
          return;
        }

        // The API can return one of two shapes:
        // (a) it needs more info → show the questions screen, or
        // (b) it's done → show the results screen.
        if (data.needsQuestions) {
          setQuestions(data.questions);
          setParsedCVState(data.parsedCV);
          setParsedJobState(data.parsedJob);
          setStep('questions');
        } else {
          setFinalOutput(data.output);
          setStep('results');
        }
      } catch {
        // This catch only fires for network-level failures (server unreachable, etc.).
        setError('Network error. Please check your connection and try again.');
        setStep('input');
      }
    },
    [cvText, jobContent] // Recreate this function if the CV or job text changes
  );

  // Validate inputs, then kick off the first analysis (no answers yet).
  const handleAnalyze = () => {
    if (!cvText) {
      setError('Please upload your CV before analyzing.');
      return;
    }
    if (!jobContent) {
      setError('Please add the job advertisement before analyzing.');
      return;
    }
    runAnalysis([]);
  };

  // Called by QuestionsStep — re-run analysis, this time WITH the user's answers.
  const handleQuestionsSubmit = (answers: UserAnswer[]) => {
    runAnalysis(answers);
  };

  // "Start over" — wipe all state back to the initial input screen.
  const handleReset = () => {
    setStep('input');
    setCvText('');
    setCvFileName('');
    setJobContent('');
    setError(null);
    setQuestions([]);
    setParsedCVState(null);
    setParsedJobState(null);
    setFinalOutput(null);
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  // Derived value: both inputs present → the "Analyze" button is enabled.
  // Computed on every render (no state needed) — cheap and always in sync.
  const isReady = Boolean(cvText && jobContent);

  return (
    // `relative` + `overflow-hidden` contain the floating background blobs below.
    <div className="relative min-h-screen overflow-hidden">
      {/* Decorative background — purely visual. `-z-10` pushes it behind content,
          `aria-hidden` hides it from screen readers since it carries no meaning. */}
      <div className="absolute inset-0 -z-10" aria-hidden="true">
        <div className="blob w-[38rem] h-[38rem] -top-40 -left-40 animate-float bg-indigo-300/60" />
        <div className="blob w-[32rem] h-[32rem] top-20 -right-40 animate-float-2 bg-fuchsia-300/50" />
        <div className="blob w-[28rem] h-[28rem] bottom-0 left-1/3 animate-float bg-violet-300/40" />
        {/* Subtle dot-grid texture drawn with a repeating radial-gradient. */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(24,24,27,0.05) 1px, transparent 0)',
            backgroundSize: '28px 28px',
          }}
        />
      </div>

      <Header />

      <main className="relative max-w-2xl mx-auto px-4 sm:px-6 py-12">
        {/* Hero — only show on the input step. In JSX, `{condition && <JSX/>}` means
            "render this only if condition is true" (React ignores false/null). */}
        {step === 'input' && (
          <div className="mb-10 space-y-4 animate-fade-up">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-violet-200/70 bg-white/70 px-3 py-1 text-xs font-medium text-violet-700 shadow-soft backdrop-blur">
              <Sparkles className="w-3.5 h-3.5" />
              AI-powered CV tailoring
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-zinc-900 tracking-tight leading-[1.1]">
              Tailor your CV to the
              <br />
              {/* &apos; is the HTML entity for an apostrophe (safer than a raw ' in JSX). */}
              <span className="text-gradient">job you&apos;re applying for.</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-500 leading-relaxed max-w-lg">
              Upload your CV, paste the job advertisement, and get a professionally
              tailored CV and cover letter — without starting from scratch.
            </p>

            {/* Three-step indicator. `.map()` turns a data array into JSX elements —
                the React way to render lists. Each item needs a unique `key`. */}
            <div className="flex flex-wrap items-center gap-x-2 gap-y-2 pt-2">
              {[
                { n: '1', label: 'Upload your CV' },
                { n: '2', label: 'Add the job' },
                { n: '3', label: 'Tailor my application' },
              ].map((s, i, arr) => (
                <div key={s.n} className="flex items-center gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-brand-gradient text-white text-xs font-semibold flex items-center justify-center shadow-glow">
                      {s.n}
                    </span>
                    <span className="text-xs font-medium text-zinc-600">{s.label}</span>
                  </div>
                  {/* Show an arrow between steps, but not after the last one. */}
                  {i < arr.length - 1 && (
                    <ArrowRight className="w-3.5 h-3.5 text-zinc-300" />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Main content area — the screen shown depends on `step`.
            This is the state machine "switch": each block is one screen. */}
        <div className="space-y-8">
          {step === 'input' && (
            // <>...</> is a React Fragment: groups elements without adding a DOM node.
            <>
              {/* CV Upload card — child reports its result via the onCVReady callback. */}
              <div className="group glass border border-zinc-200/70 rounded-2xl p-6 shadow-soft transition-all duration-300 hover:shadow-glow hover:border-violet-200 animate-fade-up">
                <UploadStep onCVReady={handleCVReady} />
              </div>

              {/* Job input card — reports its result via onJobReady. */}
              <div className="group glass border border-zinc-200/70 rounded-2xl p-6 shadow-soft transition-all duration-300 hover:shadow-glow hover:border-violet-200 animate-fade-up">
                <JobStep onJobReady={handleJobReady} />
              </div>

              {/* Privacy */}
              <PrivacyNotice />

              {/* Error banner — only rendered when `error` is non-null. */}
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 text-sm text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3"
                >
                  <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Primary call-to-action. `disabled={!isReady}` greys it out until
                  both inputs exist. onClick wires the button to our handler. */}
              <button
                onClick={handleAnalyze}
                disabled={!isReady}
                className="group w-full bg-brand-gradient-animated text-white font-semibold rounded-xl px-6 py-4 text-base shadow-glow hover:shadow-[0_16px_40px_-12px_rgba(139,92,246,0.6)] hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>Analyze my application</span>
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </button>

              {/* Helper hint under the button, showing what's still missing. */}
              {!isReady && (
                <p className="text-center text-xs text-zinc-400">
                  {!cvText && !jobContent
                    ? 'Upload your CV and add the job to continue'
                    : !cvText
                    ? 'Upload your CV to continue'
                    : 'Add the job advertisement to continue'}
                </p>
              )}
            </>
          )}

          {/* Loading screen while the AI works. */}
          {step === 'progress' && <ProgressStep />}

          {/* Clarifying-questions screen — shown only when the AI asked for more info. */}
          {step === 'questions' && (
            <div className="glass border border-zinc-200/70 rounded-2xl p-6 sm:p-8 shadow-soft animate-fade-up">
              <QuestionsStep questions={questions} onSubmit={handleQuestionsSubmit} />
            </div>
          )}

          {/* Results screen — guarded by `finalOutput &&` so we never render it empty. */}
          {step === 'results' && finalOutput && (
            <ResultsStep output={finalOutput} onReset={handleReset} />
          )}
        </div>
      </main>
    </div>
  );
}
