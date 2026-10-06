/**
 * Job Analyzer — extracts structured data from job advertisement text using Gemini.
 * Same 3-step pattern as cv-analyzer: prompt → AI → parse + Zod-validate.
 */
import { geminiGenerate } from './gemini-client';
import { buildJobExtractionPrompt } from '@/lib/prompts/job-extraction';
import { ParsedJobSchema } from '@/lib/schemas/job';
import type { ParsedJob } from '@/types';
import { safeJsonParse } from '@/lib/utils';
import { cacheKey, getOrCompute } from '@/lib/cache';

export const JOB_DETAILS_MISSING_ERROR =
  'We could not identify job-specific requirements or a clear role description in the provided text. The site may have returned a sign-in or access-restricted page, or the job description may be incomplete. Open the listing and paste its full description before analyzing.';

// Cached by job text so the questions round-trip reuses the first analysis.
export function analyzeJob(jobText: string): Promise<ParsedJob> {
  return getOrCompute(cacheKey('analyzeJob', jobText), () => runAnalyzeJob(jobText));
}

export function hasJobSpecificDetails(job: ParsedJob): boolean {
  const detailGroups = [
    job.responsibilities,
    job.requiredQualifications,
    job.preferredQualifications,
    job.requiredSkills,
    job.preferredSkills,
    job.technologies,
    job.experienceRequirements,
    job.educationRequirements,
    job.languages,
  ];

  return (
    detailGroups.some((group) => group.some((detail) => detail.trim().length > 0)) ||
    (job.jobTitle.trim().length > 0 && job.summary.trim().length >= 120)
  );
}

async function runAnalyzeJob(jobText: string): Promise<ParsedJob> {
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
