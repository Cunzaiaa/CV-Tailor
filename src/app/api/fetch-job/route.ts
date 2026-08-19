/**
 * POST /api/fetch-job  — server-side scraper for a job-ad URL.
 *
 * Scraping must run on the server (the browser can't fetch other sites due to
 * CORS, and we want to hide our request). Returns readable text, or a
 * `fallbackRequired` flag so the UI can ask the user to paste instead.
 */
import { NextRequest, NextResponse } from 'next/server';
import { scrapeJobUrl } from '@/lib/services/job-scraper';
import { validateJobUrl } from '@/lib/validation';

export const runtime = 'nodejs';
export const maxDuration = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    let body: { url?: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body.' }, { status: 400 });
    }

    const url = body.url ?? '';
    // SECURITY: validate the URL (e.g. block internal/localhost addresses — SSRF)
    // before we ever fetch it.
    const validation = validateJobUrl(url);
    if (!validation.valid) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    // The service does the fetch + HTML → text extraction and returns a result object.
    const result = await scrapeJobUrl(url.trim());
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : 'Failed to fetch job advertisement.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
