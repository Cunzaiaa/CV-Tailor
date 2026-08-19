/**
 * POST /api/analyze  — the MAIN backend endpoint (the orchestrator of the AI pipeline).
 *
 * In Next.js App Router, a file named `route.ts` under `app/api/.../` defines an
 * HTTP endpoint. Exporting a function named `POST` handles POST requests to that
 * path (there's also GET, PUT, DELETE, etc.). This is Next's equivalent of a
 * Spring `@RestController` with a `@PostMapping` — but the file's folder path IS
 * the URL. This code runs ONLY on the server, so it can safely use the API key.
 *
 * Full analysis pipeline:
 * 1. Analyze CV → structured CV
 * 2. Analyze job → structured job
 * 3. Match CV vs job → score, gaps, strengths, questions
 * 4. If questions needed → return them
 * 5. If no questions (or answers provided) → generate tailored CV + cover letter
 */
import { NextRequest, NextResponse } from 'next/server';
// Each service encapsulates one AI task (like injected Spring @Services).
import { analyzeCV } from '@/lib/services/cv-analyzer';
import { analyzeJob } from '@/lib/services/job-analyzer';
import { matchCVToJob } from '@/lib/services/matcher';
import { generateTailoredCV } from '@/lib/services/cv-generator';
import { generateCoverLetter } from '@/lib/services/cover-letter-generator';
import { validateCVText, validateJobText } from '@/lib/validation';
import type { UserAnswer, AnalyzeRequest } from '@/types';

// Route config: run on the Node.js runtime (not Edge) and allow up to 120s,
// because chained AI calls are slow. These are special Next.js exports.
export const runtime = 'nodejs';
export const maxDuration = 120; // AI calls can take time

// The POST handler. Receives the incoming request, returns a JSON response.
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Parse the JSON body. Wrapped in its own try/catch to return a clean 400
    // if the client sent malformed JSON.
    let body: AnalyzeRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    // Destructure with a default: `userAnswers = []` if the field is missing.
    const { cvText, jobContent, userAnswers = [] } = body;

    // Validate inputs at the boundary (never trust client input). `?? ''` guards
    // against null/undefined before validation.
    const cvValidation = validateCVText(cvText ?? '');
    if (!cvValidation.valid) {
      return NextResponse.json({ error: cvValidation.error }, { status: 400 });
    }

    const jobValidation = validateJobText(jobContent ?? '');
    if (!jobValidation.valid) {
      return NextResponse.json({ error: jobValidation.error }, { status: 400 });
    }

    // Defensive: ensure answers is really an array before we use it.
    const answers: UserAnswer[] = Array.isArray(userAnswers) ? userAnswers : [];

    // ── Step 1 & 2: Parse CV and job in parallel ───────────────────────────
    // Promise.all runs both AI calls concurrently and waits for BOTH — faster
    // than awaiting them one after another (they're independent).
    const [parsedCV, parsedJob] = await Promise.all([
      analyzeCV(cvText),
      analyzeJob(jobContent),
    ]);

    // ── Step 3: Match CV against job ────────────────────────────────────────
    const matching = await matchCVToJob(parsedCV, parsedJob, answers);

    // ── Step 4: Return questions if needed and no answers yet ───────────────
    // First pass: if the AI wants clarification and the user hasn't answered yet,
    // short-circuit and send the questions back to the frontend.
    const hasAnswers = answers.length > 0;
    if (matching.needsQuestions && !hasAnswers) {
      return NextResponse.json({
        needsQuestions: true,
        parsedCV,
        parsedJob,
        questions: matching.questions,
      });
    }

    // ── Step 5: Generate tailored CV and cover letter ───────────────────────
    // The cover letter depends on the tailored CV, so we generate the CV first,
    // THEN the cover letter (they can't run fully in parallel).
    const [tailoredCV, coverLetter] = await Promise.all([
      generateTailoredCV(parsedCV, parsedJob, answers),
      // We pass a placeholder for cover letter since tailoredCV isn't ready yet
      // We'll generate the cover letter after tailored CV
      Promise.resolve(null),
    ]);

    const coverLetterResult = await generateCoverLetter(
      parsedCV,
      parsedJob,
      tailoredCV,
      answers
    );

    // ── Return final output ─────────────────────────────────────────────────
    // Assemble the FinalOutput shape the frontend expects.
    return NextResponse.json({
      needsQuestions: false,
      output: {
        analysis: {
          matchScore: matching.matchScore,
          strengths: matching.strengths,
          gaps: matching.gaps,
          importantNotes: matching.importantNotes,
        },
        tailoredCV,
        coverLetter: coverLetterResult,
        candidateName: parsedCV.candidate.name,
        jobTitle: parsedJob.jobTitle,
        company: parsedJob.company,
      },
    });
  } catch (error: unknown) {
    // Catch-all: convert any thrown error into a safe 500 response.
    // `error instanceof Error` narrows the `unknown` type so we can read .message.
    const message =
      error instanceof Error ? error.message : 'Analysis failed. Please try again.';
    // SECURITY: scrub anything that might leak secrets before sending to the client.
    const safeMessage = message.replace(/key|secret|token|password/gi, '[REDACTED]');
    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
