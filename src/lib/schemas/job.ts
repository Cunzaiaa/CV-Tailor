// Zod schema for the PARSED JOB posting (runtime-validates the AI's job extraction).
// See schemas/cv.ts for a fuller explanation of how/why Zod is used here.
import { z } from 'zod';

export const ParsedJobSchema = z.object({
  jobTitle: z.string().default(''),
  company: z.string().default(''),
  location: z.string().default(''),
  employmentType: z.string().default(''),
  summary: z.string().default(''),
  responsibilities: z.array(z.string()).default([]),
  requiredQualifications: z.array(z.string()).default([]),
  preferredQualifications: z.array(z.string()).default([]),
  requiredSkills: z.array(z.string()).default([]),
  preferredSkills: z.array(z.string()).default([]),
  technologies: z.array(z.string()).default([]),
  experienceRequirements: z.array(z.string()).default([]),
  educationRequirements: z.array(z.string()).default([]),
  languages: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
});

export type ParsedJobSchema = z.infer<typeof ParsedJobSchema>;
