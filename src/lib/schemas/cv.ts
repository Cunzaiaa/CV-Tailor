// ─────────────────────────────────────────────────────────────────────────────
// Zod schemas for the PARSED CV.
//
// Zod is a RUNTIME validator. TypeScript types (in /types) vanish at build time
// and can't check real data; Zod schemas exist at runtime and actually verify the
// shape of unpredictable AI output. `.default(...)` fills missing fields so we
// never crash on a value the AI forgot to include.
//
// Bonus: `z.infer<typeof Schema>` derives a matching TS type from the schema, so
// the validator and the type can never drift apart — one source of truth.
// ─────────────────────────────────────────────────────────────────────────────
import { z } from 'zod';

// ── Candidate contact ──────────────────────────────────────────────────────────

export const CandidateContactSchema = z.object({
  name: z.string().default(''),   // z.string() = must be a string; .default('') = fill if missing
  email: z.string().default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  links: z.array(z.string()).default([]), // An array of strings, defaulting to empty
});

// ── Work experience ────────────────────────────────────────────────────────────

export const WorkExperienceSchema = z.object({
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

// ── Education ─────────────────────────────────────────────────────────────────

export const EducationSchema = z.object({
  degree: z.string(),
  institution: z.string(),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  grade: z.string().default(''),
  notes: z.string().default(''),
});

// ── Certification ─────────────────────────────────────────────────────────────

export const CertificationSchema = z.object({
  name: z.string(),
  issuer: z.string().default(''),
  date: z.string().default(''),
  expiryDate: z.string().default(''),
});

// ── Project ───────────────────────────────────────────────────────────────────

export const ProjectSchema = z.object({
  name: z.string(),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  url: z.string().default(''),
  highlights: z.array(z.string()).default([]),
});

// ── Full Parsed CV ─────────────────────────────────────────────────────────────

// Composes all the smaller schemas above into the full CV shape. Nesting schemas
// like this mirrors how the TS interfaces nest in /types.
export const ParsedCVSchema = z.object({
  candidate: CandidateContactSchema,
  summary: z.string().default(''),
  experience: z.array(WorkExperienceSchema).default([]),
  education: z.array(EducationSchema).default([]),
  skills: z.array(z.string()).default([]),
  certifications: z.array(CertificationSchema).default([]),
  languages: z.array(z.string()).default([]),
  projects: z.array(ProjectSchema).default([]),
  achievements: z.array(z.string()).default([]),
});

// Derive a TS type straight from the schema (keeps type + validation in sync).
export type ParsedCVSchema = z.infer<typeof ParsedCVSchema>;
