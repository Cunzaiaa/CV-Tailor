/**
 * Matcher — compares parsed CV with parsed job and determines match score,
 * gaps, strengths, and whether follow-up questions are needed.
 * This is the "brain" that decides if the app needs to ask the user questions.
 */
import { geminiGenerate } from './gemini-client';
import { buildMatchingPrompt } from '@/lib/prompts/matching';
import { MatchingAnalysisSchema } from '@/lib/schemas/analysis';
import type { ParsedCV, ParsedJob, UserAnswer, MatchingAnalysis } from '@/types';
import { safeJsonParse, clamp } from '@/lib/utils';

export async function matchCVToJob(
  cv: ParsedCV,
  job: ParsedJob,
  userAnswers?: UserAnswer[] // Optional — present on the second pass after Q&A
): Promise<MatchingAnalysis> {
  const prompt = buildMatchingPrompt(cv, job, userAnswers);
  const rawResponse = await geminiGenerate(prompt);

  const parsed = safeJsonParse(rawResponse, null);
  if (!parsed) {
    throw new Error('Failed to parse matching analysis. Please try again.');
  }

  const result = MatchingAnalysisSchema.safeParse(parsed);
  if (!result.success) {
    // Fallback: construct a minimal valid response
    return {
      matchScore: 0,
      strengths: [],
      gaps: ['Unable to perform detailed matching analysis. Please try again.'],
      importantNotes: [],
      needsQuestions: false,
      questions: [],
    };
  }

  return {
    ...result.data,
    // `clamp` forces the AI's score into the valid 0–100 range, in case it returns
    // something out of bounds. Spreading result.data first, then overriding the score.
    matchScore: clamp(result.data.matchScore, 0, 100),
  } as MatchingAnalysis;
}
