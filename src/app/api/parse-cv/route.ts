/**
 * POST /api/parse-cv  — extracts plain text from an uploaded CV.
 *
 * This one endpoint handles TWO input shapes, decided by the Content-Type header:
 *   • multipart/form-data → a real file upload (PDF/DOCX)
 *   • application/json    → the user pasted raw text
 * Server-side only — files are parsed in memory and never permanently stored.
 */
import { NextRequest, NextResponse } from 'next/server';
import { parseCVFile } from '@/lib/services/cv-parser';
import { validateCVText } from '@/lib/validation';

export const runtime = 'nodejs'; // Need Node APIs (Buffer, pdf/docx libs) — not Edge
export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    // Read the Content-Type header to decide which path to take. `?? ''` avoids null.
    const contentType = request.headers.get('content-type') ?? '';

    // ── File upload path ────────────────────────────────────────────────────
    if (contentType.includes('multipart/form-data')) {
      let formData: FormData;
      try {
        formData = await request.formData();
      } catch {
        return NextResponse.json(
          { error: 'Failed to parse form data. Please try again.' },
          { status: 400 }
        );
      }

      const file = formData.get('cv') as File | null;
      if (!file) {
        return NextResponse.json(
          { error: 'No file was uploaded. Please select a PDF or DOCX file.' },
          { status: 400 }
        );
      }

      // Delegate the actual PDF/DOCX → text extraction to the service.
      const result = await parseCVFile(file);
      return NextResponse.json({ text: result.text, fileName: result.fileName });
    }

    // ── Text paste path ─────────────────────────────────────────────────────
    if (contentType.includes('application/json')) {
      let body: { text?: string };
      try {
        body = await request.json();
      } catch {
        return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
      }

      const text = body.text ?? '';
      const validation = validateCVText(text); // Reject empty/too-short text
      if (!validation.valid) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }

      // No extraction needed — the text is already plain. Just trim and return it.
      return NextResponse.json({ text: text.trim(), fileName: 'pasted-cv.txt' });
    }

    return NextResponse.json(
      { error: 'Unsupported content type. Use multipart/form-data or application/json.' },
      { status: 415 }
    );
  } catch (error: unknown) {
    // Never expose internal errors
    const message =
      error instanceof Error ? error.message : 'An unexpected error occurred.';

    // Filter out any potential sensitive info from error messages
    const safeMessage = message.replace(/key|secret|token|password/gi, '[REDACTED]');

    return NextResponse.json({ error: safeMessage }, { status: 500 });
  }
}
