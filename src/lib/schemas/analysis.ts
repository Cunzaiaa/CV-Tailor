// Zod schema for the MATCHING ANALYSIS (score, gaps, strengths, follow-up questions).
// Validates what the matcher service gets back from the AI.
import { z } from 'zod';

export const MatchQuestionSchema = z.object({
  id: z.string(),
  question: z.string(),
  reason: z.string(),
  relatedRequirement: z.string(),
});

export const MatchingAnalysisSchema = z.object({
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  importantNotes: z.array(z.string()).default([]),
  needsQuestions: z.boolean(),
  questions: z.array(MatchQuestionSchema).default([]),
});

export type MatchingAnalysisSchema = z.infer<typeof MatchingAnalysisSchema>;
