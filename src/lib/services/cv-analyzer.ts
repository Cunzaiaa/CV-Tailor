/**
 * CV Analyzer — extracts structured data from raw CV text using Gemini.
 *
 * Pattern used by every AI service here:
 *   1. Build a prompt from a template.
 *   2. Send it to Gemini → get back a JSON string.
 *   3. Parse the JSON, then VALIDATE it with a Zod schema (never trust AI output).
 * Zod is a runtime validator: unlike TS types (compile-time only), it actually
 * checks the shape at runtime and can fill defaults — crucial for unpredictable AI.
 */
import { geminiGenerate } from './gemini-client';
import { buildCVExtractionPrompt } from '@/lib/prompts/cv-extraction';
import { ParsedCVSchema } from '@/lib/schemas/cv';
import type { ParsedCV } from '@/types';
import { safeJsonParse } from '@/lib/utils';

export async function analyzeCV(cvText: string): Promise<ParsedCV> {
  const prompt = buildCVExtractionPrompt(cvText); // 1. Build the instruction prompt
  const rawResponse = await geminiGenerate(prompt); // 2. Ask the AI

  // 3a. Parse JSON safely — returns null instead of throwing on bad JSON.
  const parsed = safeJsonParse(rawResponse, null);
  if (!parsed) {
    throw new Error('Failed to parse CV analysis response. Please try again.');
  }

  // 3b. Validate with Zod. `safeParse` returns {success, data|error} rather than throwing.
  const result = ParsedCVSchema.safeParse(parsed);
  if (!result.success) {
    // The AI's output didn't fully match. Rather than fail, try to salvage a PARTIAL
    // result and merge it over a set of safe empty defaults — graceful degradation.
    const partial = ParsedCVSchema.partial().safeParse(parsed);
    if (partial.success) {
      return ParsedCVSchema.parse({
        candidate: { name: '', email: '', phone: '', location: '', links: [] },
        summary: '',
        experience: [],
        education: [],
        skills: [],
        certifications: [],
        languages: [],
        projects: [],
        achievements: [],
        ...partial.data, // Spread the salvaged fields over the defaults
      });
    }
    throw new Error('CV analysis returned unexpected data. Please try again.');
  }

  return result.data as ParsedCV;
}
