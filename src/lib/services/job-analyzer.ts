/**
 * Job Analyzer — extracts structured data from job advertisement text using Gemini.
 * Same 3-step pattern as cv-analyzer: prompt → AI → parse + Zod-validate.
 */
import { geminiGenerate } from './gemini-client';
import { buildJobExtractionPrompt } from '@/lib/prompts/job-extraction';
import { ParsedJobSchema } from '@/lib/schemas/job';
import type { ParsedJob } from '@/types';
import { safeJsonParse } from '@/lib/utils';

export async function analyzeJob(jobText: string): Promise<ParsedJob> {
  const prompt = buildJobExtractionPrompt(jobText);
  const rawResponse = await geminiGenerate(prompt);

  const parsed = safeJsonParse(rawResponse, null);
  if (!parsed) {
    throw new Error('Failed to parse job analysis response. Please try again.');
  }

  const result = ParsedJobSchema.safeParse(parsed);
  if (!result.success) {
    // Graceful fallback: return an empty-but-valid job so the pipeline can continue
    // instead of crashing the whole request.
    return {
      jobTitle: '',
      company: '',
      location: '',
      employmentType: '',
      summary: '',
      responsibilities: [],
      requiredQualifications: [],
      preferredQualifications: [],
      requiredSkills: [],
      preferredSkills: [],
      technologies: [],
      experienceRequirements: [],
      educationRequirements: [],
      languages: [],
      keywords: [],
    };
  }

  return result.data as ParsedJob;
}
