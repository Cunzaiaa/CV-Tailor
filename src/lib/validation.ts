/**
 * Input validation for uploaded files and user-provided data.
 * All validation runs server-side. This is our security/quality boundary — never
 * trust data from the browser, so every entry point validates before processing.
 */

// `as const` freezes these into readonly literal-typed tuples (not just string[]),
// which lets TypeScript check membership precisely below.
export const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB
export const ALLOWED_MIME_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/msword',
] as const;

export const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.doc'] as const;
export const MAX_CV_TEXT_CHARS = 50_000; // ~12,500 tokens (the _ is just a digit separator)
export const MAX_JOB_TEXT_CHARS = 20_000; // ~5,000 tokens

// A common return shape for all validators: valid + an optional error message.
export interface ValidationResult {
  valid: boolean;
  error?: string; // The `?` marks this field optional
}

/**
 * Validate an uploaded file's type and size.
 */
export function validateUploadedFile(
  file: File | { name: string; size: number; type: string }
): ValidationResult {
  if (!file) {
    return { valid: false, error: 'No file provided.' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: `File is too large. Maximum size is 5MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`,
    };
  }

  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  // Accept the file if EITHER the extension OR the MIME type is on the allow-list
  // (browsers don't always report a reliable MIME type, so we check both).
  const validExt = ALLOWED_EXTENSIONS.includes(ext as (typeof ALLOWED_EXTENSIONS)[number]);
  const validMime = ALLOWED_MIME_TYPES.includes(file.type as (typeof ALLOWED_MIME_TYPES)[number]);

  if (!validExt && !validMime) {
    return {
      valid: false,
      error: 'Unsupported file type. Please upload a PDF or DOCX file.',
    };
  }

  return { valid: true };
}

/**
 * Validate that CV text is non-empty and not too short to be a real CV.
 */
export function validateCVText(text: string): ValidationResult {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'CV text is empty. Please provide your CV.' };
  }

  if (trimmed.length < 100) {
    return {
      valid: false,
      error: 'The CV text appears to be too short. Please provide a complete CV.',
    };
  }

  if (trimmed.length > MAX_CV_TEXT_CHARS) {
    return {
      valid: false,
      error: `The CV is too long (${trimmed.length} characters). Please provide a more concise version.`,
    };
  }

  return { valid: true };
}

/**
 * Validate a job URL.
 */
export function validateJobUrl(url: string): ValidationResult {
  if (!url || !url.trim()) {
    return { valid: false, error: 'Please provide a job advertisement URL.' };
  }

  try {
    const parsed = new URL(url.trim());
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { valid: false, error: 'Please provide a valid http or https URL.' };
    }
    return { valid: true };
  } catch {
    return { valid: false, error: 'The URL is not valid. Please check and try again.' };
  }
}

/**
 * Validate job description text.
 */
export function validateJobText(text: string): ValidationResult {
  const trimmed = text.trim();

  if (!trimmed) {
    return { valid: false, error: 'Job description is empty.' };
  }

  if (trimmed.length < 50) {
    return {
      valid: false,
      error: 'The job description appears too short. Please provide the full job advertisement.',
    };
  }

  return { valid: true };
}
