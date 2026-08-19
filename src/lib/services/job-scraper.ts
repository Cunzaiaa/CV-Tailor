/**
 * Job scraper — server-side only.
 * Fetches a job advertisement URL and extracts readable text content.
 * Uses @mozilla/readability for clean extraction.
 * Falls back gracefully when URLs are inaccessible.
 */
import { JSDOM } from 'jsdom';
import { Readability } from '@mozilla/readability';
import { truncateText, isValidUrl } from '@/lib/utils';
import { MAX_JOB_TEXT_CHARS } from '@/lib/validation';

export interface JobScrapingResult {
  content: string;
  url: string;
  success: boolean;
  fallbackRequired: boolean;
  errorReason?: string;
}

const FETCH_TIMEOUT_MS = 15000; // 15 seconds
const MAX_RESPONSE_BYTES = 5 * 1024 * 1024; // 5MB

/**
 * Attempt to fetch and extract readable content from a job advertisement URL.
 *
 * Note this never THROWS on expected failures — it returns a result object with
 * `success`/`fallbackRequired` flags so the caller/UI can react calmly (e.g. ask
 * the user to paste the text instead). This is the "result object" error style.
 */
export async function scrapeJobUrl(url: string): Promise<JobScrapingResult> {
  if (!isValidUrl(url)) {
    return {
      content: '',
      url,
      success: false,
      fallbackRequired: true,
      errorReason: 'Invalid URL',
    };
  }

  try {
    // AbortController lets us cancel the fetch if it takes too long. We start a
    // timer that calls .abort() after FETCH_TIMEOUT_MS, then pass its `signal` to fetch.
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    let response: Response;
    try {
      response = await fetch(url, {
        signal: controller.signal,
        headers: {
          // Use a realistic user agent to reduce bot blocking
          'User-Agent':
            'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
          Accept:
            'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.5',
        },
      });
    } finally {
      clearTimeout(timeoutId); // Always clear the timer so it can't fire later
    }

    if (!response.ok) {
      return {
        content: '',
        url,
        success: false,
        fallbackRequired: true,
        errorReason: `HTTP ${response.status}: ${response.statusText}`,
      };
    }

    const contentType = response.headers.get('content-type') ?? '';
    if (!contentType.includes('text/html') && !contentType.includes('application/xhtml')) {
      return {
        content: '',
        url,
        success: false,
        fallbackRequired: true,
        errorReason: 'Page is not HTML',
      };
    }

    // Read response body with size limit
    const reader = response.body?.getReader();
    if (!reader) {
      return {
        content: '',
        url,
        success: false,
        fallbackRequired: true,
        errorReason: 'Could not read response',
      };
    }

    let totalBytes = 0;
    const chunks: Uint8Array[] = [];
    // Stream the body chunk-by-chunk so we can enforce a size cap (avoids a huge
    // page eating all our memory — a simple DoS safeguard).
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > MAX_RESPONSE_BYTES) {
        reader.cancel();
        break;
      }
      chunks.push(value);
    }

    // Join all chunks and decode the bytes into a UTF-8 HTML string.
    const html = Buffer.concat(chunks.map((c) => Buffer.from(c))).toString('utf-8');

    // Parse with JSDOM + Readability for clean text extraction.
    // JSDOM builds a fake DOM on the server; Readability (the engine behind
    // Firefox Reader View) strips nav/ads/boilerplate to get the main article text.
    const dom = new JSDOM(html, { url });
    const reader2 = new Readability(dom.window.document);
    const article = reader2.parse();

    if (!article || !article.textContent || article.textContent.trim().length < 100) {
      // Readability failed — try a basic text extraction fallback (just the <body> text).
      const bodyText = dom.window.document.body?.textContent ?? '';
      const cleaned = cleanText(bodyText);

      if (cleaned.length < 100) {
        return {
          content: '',
          url,
          success: false,
          fallbackRequired: true,
          errorReason: 'Could not extract readable content from page',
        };
      }

      return {
        content: truncateText(cleaned, MAX_JOB_TEXT_CHARS),
        url,
        success: true,
        fallbackRequired: false,
      };
    }

    const extracted = cleanText(article.textContent);
    return {
      content: truncateText(extracted, MAX_JOB_TEXT_CHARS),
      url,
      success: true,
      fallbackRequired: false,
    };
  } catch (error: unknown) {
    const reason =
      error instanceof Error
        ? error.name === 'AbortError'
          ? 'Request timed out'
          : error.message
        : 'Unknown error';

    return {
      content: '',
      url,
      success: false,
      fallbackRequired: true,
      errorReason: reason,
    };
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\t/g, ' ')
    .replace(/[ ]{2,}/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}
