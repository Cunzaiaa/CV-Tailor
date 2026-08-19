// ─────────────────────────────────────────────────────────────────────────────
// Global TypeScript types for CV Tailor
//
// A TypeScript `interface` is a compile-time contract describing the SHAPE of an
// object — think of it like a Java DTO/POJO or a record, but with NO runtime code.
// After compilation these vanish entirely; they exist only to catch mistakes in
// the editor and during build. There are no getters/setters — just plain fields.
// These types are shared by both the frontend and backend, keeping them in sync.
// ─────────────────────────────────────────────────────────────────────────────

// ── CV structures ─────────────────────────────────────────────────────────────
// These model a candidate's CV once the AI has parsed it into structured data.

export interface CandidateContact {
  name: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
}

export interface WorkExperience {
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export interface Education {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
  notes: string;
}

export interface Certification {
  name: string;
  issuer: string;
  date: string;
  expiryDate: string;
}

export interface Project {
  name: string;
  description: string;
  technologies: string[];
  url: string;
  highlights: string[];
}

export interface ParsedCV {
  candidate: CandidateContact;
  summary: string;
  experience: WorkExperience[];
  education: Education[];
  skills: string[];
  certifications: Certification[];
  languages: string[];
  projects: Project[];
  achievements: string[];
}

// ── Job structures ─────────────────────────────────────────────────────────────

export interface ParsedJob {
  jobTitle: string;
  company: string;
  location: string;
  employmentType: string;
  summary: string;
  responsibilities: string[];
  requiredQualifications: string[];
  preferredQualifications: string[];
  requiredSkills: string[];
  preferredSkills: string[];
  technologies: string[];
  experienceRequirements: string[];
  educationRequirements: string[];
  languages: string[];
  keywords: string[];
}

// ── Analysis structures ────────────────────────────────────────────────────────

export interface MatchQuestion {
  id: string;
  question: string;
  reason: string;
  relatedRequirement: string;
}

export interface MatchingAnalysis {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  importantNotes: string[];
  needsQuestions: boolean;
  questions: MatchQuestion[];
}

// ── Final output structures ────────────────────────────────────────────────────

export interface TailoredExperience {
  jobTitle: string;
  employer: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  responsibilities: string[];
  achievements: string[];
  technologies: string[];
}

export interface TailoredEducation {
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  grade: string;
}

export interface TailoredCV {
  summary: string;
  experience: TailoredExperience[];
  education: TailoredEducation[];
  skills: string[];
  certifications: string[];
  languages: string[];
  projects: Project[];
}

export interface CoverLetter {
  content: string;
}

export interface AnalysisResult {
  matchScore: number;
  strengths: string[];
  gaps: string[];
  importantNotes: string[];
}

export interface FinalOutput {
  analysis: AnalysisResult;
  tailoredCV: TailoredCV;
  coverLetter: CoverLetter;
  candidateName: string;
  jobTitle: string;
  company: string;
}

// ── UI state types ─────────────────────────────────────────────────────────────

// A UNION type: `AppStep` can be exactly one of these string literals — nothing
// else compiles. This is how we model the front-end state machine safely
// (similar to a Java enum, but built from string constants).
export type AppStep =
  | 'input'
  | 'progress'
  | 'questions'
  | 'results';

export interface ProgressMessage {
  message: string;
  done: boolean;
}

export interface UserAnswer {
  questionId: string;
  answer: string;
}

// ── API request/response types ─────────────────────────────────────────────────

export interface ParseCVResponse {
  text: string;
  fileName: string;
}

export interface FetchJobResponse {
  content: string;
  url: string;
  success: boolean;
  fallbackRequired: boolean;
}

export interface AnalyzeRequest {
  cvText: string;
  jobContent: string;
  userAnswers?: UserAnswer[];
}

export interface QuestionsResponse {
  needsQuestions: true;
  parsedCV: ParsedCV;
  parsedJob: ParsedJob;
  questions: MatchQuestion[];
}

export interface FinalOutputResponse {
  needsQuestions: false;
  output: FinalOutput;
}

// A DISCRIMINATED UNION: the `needsQuestions` boolean tells TypeScript which of
// the two shapes a response actually is. After checking `if (data.needsQuestions)`
// the compiler narrows the type automatically — no casting needed.
export type AnalyzeResponse = QuestionsResponse | FinalOutputResponse;

export interface ApiError {
  error: string;
  details?: string;
}
