// Zod schemas for the FINAL OUTPUT: the tailored CV and cover letter the AI generates.
// Note it reuses ProjectSchema from cv.ts — schemas compose just like the types do.
import { z } from 'zod';
import { ProjectSchema } from './cv';

// ── Tailored CV sections ────────────────────────────────────────────────────────

export const TailoredExperienceSchema = z.object({
  jobTitle: z.string(),
  employer: z.string(),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  current: z.boolean().default(false),
  responsibilities: z.array(z.string()).default([]),
  achievements: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
});

export const TailoredEducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  grade: z.string().default(''),
});

export const TailoredCVSchema = z.object({
  summary: z.string().default(''),
  experience: z.array(TailoredExperienceSchema).default([]),
  education: z.array(TailoredEducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  projects: z.array(ProjectSchema).default([]),
});

// ── Cover letter ──────────────────────────────────────────────────────────────

export const CoverLetterSchema = z.object({
  content: z.string(),
});

// ── Analysis result ───────────────────────────────────────────────────────────

export const AnalysisResultSchema = z.object({
  matchScore: z.number().min(0).max(100),
  strengths: z.array(z.string()).default([]),
  gaps: z.array(z.string()).default([]),
  importantNotes: z.array(z.string()).default([]),
});

// ── Final output ──────────────────────────────────────────────────────────────

export const FinalOutputSchema = z.object({
  analysis: AnalysisResultSchema,
  tailoredCV: TailoredCVSchema,
  coverLetter: CoverLetterSchema,
  candidateName: z.string().default(''),
  jobTitle: z.string().default(''),
  company: z.string().default(''),
});

export type FinalOutputSchema = z.infer<typeof FinalOutputSchema>;
