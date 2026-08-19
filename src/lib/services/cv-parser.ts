/**
 * CV Parser — server-side only.
 * Extracts text content from PDF and DOCX files.
 * Does NOT store files permanently.
 */
import { validateUploadedFile, validateCVText, MAX_CV_TEXT_CHARS } from '@/lib/validation';
import { truncateText } from '@/lib/utils';

/**
 * Parse a PDF buffer and extract its text content.
 */
async function parsePDF(buffer: Buffer): Promise<string> {
  // Dynamic import (loaded on demand). The @ts-expect-error + fallback handle
  // this library's messy CommonJS/ESM exports — a common Node interop headache.
  // @ts-expect-error - pdf-parse types are inconsistent with its CJS/ESM exports
  const pdfParse = (await import('pdf-parse')).default || (await import('pdf-parse'));
  const data = await (pdfParse as any)(buffer);
  return data.text;
}

/**
 * Parse a DOCX buffer and extract its text content.
 */
async function parseDOCX(buffer: Buffer): Promise<string> {
  const mammoth = await import('mammoth'); // Library that reads Word documents
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

export interface ParsedCVFile {
  text: string;
  fileName: string;
  charCount: number;
}

/**
 * Main CV parsing function.
 * Accepts a File (from FormData) and returns extracted text.
 */
export async function parseCVFile(file: File): Promise<ParsedCVFile> {
  // Validate file (size, type) before doing any work.
  const validation = validateUploadedFile(file);
  if (!validation.valid) {
    throw new Error(validation.error);
  }

  // Convert the File into a Node Buffer. `arrayBuffer()` gives raw bytes;
  // Buffer is Node's binary-data type that the PDF/DOCX libraries expect.
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const fileName = file.name;
  // Grab the extension: split on '.', take the last piece, lowercase it.
  const ext = fileName.split('.').pop()?.toLowerCase();

  let rawText: string;

  // Pick the extractor based on the file type.
  if (ext === 'pdf') {
    rawText = await parsePDF(buffer);
  } else if (ext === 'docx' || ext === 'doc') {
    rawText = await parseDOCX(buffer);
  } else {
    throw new Error('Unsupported file type. Please upload a PDF or DOCX file.');
  }

  // Normalize whitespace so the AI gets clean, consistent text.
  // Chained .replace() calls with regexes: unify line endings, then collapse runs.
  const cleaned = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .replace(/[ \t]{2,}/g, ' ') // Collapse excessive spaces
    .trim();

  // Make sure we actually got usable text (not an empty/scanned PDF).
  const textValidation = validateCVText(cleaned);
  if (!textValidation.valid) {
    throw new Error(textValidation.error ?? 'Failed to extract text from the CV file.');
  }

  // Cap the length to keep AI prompts within limits.
  const truncated = truncateText(cleaned, MAX_CV_TEXT_CHARS);

  return {
    text: truncated,
    fileName,
    charCount: truncated.length,
  };
}
