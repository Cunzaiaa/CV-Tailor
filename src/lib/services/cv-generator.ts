/**
 * CV Generator — produces a professionally tailored CV using Gemini.
 * Takes the parsed CV + job (+ any user answers) and asks the AI to rewrite the
 * CV so it emphasizes what matters for THIS job. Same prompt→AI→validate pattern.
 */
import { geminiGenerate } from './gemini-client';
import { buildCVGenerationPrompt } from '@/lib/prompts/cv-generation';
import { TailoredCVSchema } from '@/lib/schemas/output';
import type { ParsedCV, ParsedJob, UserAnswer, TailoredCV } from '@/types';
import { safeJsonParse } from '@/lib/utils';

export async function generateTailoredCV(
  cv: ParsedCV,       // The candidate's structured CV
  job: ParsedJob,     // The structured job posting
  userAnswers: UserAnswer[] // Clarifications the user provided (may be empty)
): Promise<TailoredCV> {
  const prompt = buildCVGenerationPrompt(cv, job, userAnswers);
  const rawResponse = await geminiGenerate(prompt);

  const parsed = safeJsonParse(rawResponse, null);
  if (!parsed) {
    throw new Error('Failed to generate tailored CV. Please try again.');
  }

  const result = TailoredCVSchema.safeParse(parsed);
  if (!result.success) {
    throw new Error('Tailored CV generation returned unexpected data. Please try again.');
  }

  return result.data as TailoredCV;
}
