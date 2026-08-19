/**
 * Cover Letter Generator — produces a tailored cover letter using Gemini.
 * Runs LAST in the pipeline because it uses the already-tailored CV as input.
 */
import { geminiGenerate } from './gemini-client';
import { buildCoverLetterPrompt } from '@/lib/prompts/cover-letter-generation';
import { CoverLetterSchema } from '@/lib/schemas/output';
import type { ParsedCV, ParsedJob, UserAnswer, TailoredCV, CoverLetter } from '@/types';
import { safeJsonParse } from '@/lib/utils';

export async function generateCoverLetter(
  cv: ParsedCV,
  job: ParsedJob,
  tailoredCV: TailoredCV, // Depends on the CV generator's output
  userAnswers: UserAnswer[]
): Promise<CoverLetter> {
  const prompt = buildCoverLetterPrompt(cv, job, tailoredCV, userAnswers);
  const rawResponse = await geminiGenerate(prompt);

  const parsed = safeJsonParse(rawResponse, null);
  if (!parsed) {
    throw new Error('Failed to generate cover letter. Please try again.');
  }

  const result = CoverLetterSchema.safeParse(parsed);
  if (!result.success) {
    // Be forgiving about the AI's output shape. Sometimes it returns a bare string,
    // or an object with a `content` field, instead of the exact schema. Accept both.
    if (typeof parsed === 'string') {
      return { content: parsed };
    }
    if (typeof (parsed as { content?: unknown }).content === 'string') {
      return { content: (parsed as { content: string }).content };
    }
    throw new Error('Cover letter generation returned unexpected data. Please try again.');
  }

  return result.data as CoverLetter;
}
