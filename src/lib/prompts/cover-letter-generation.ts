import type { ParsedCV, ParsedJob, UserAnswer, TailoredCV } from '@/types';

/**
 * Prompt for generating a tailored cover letter.
 * Must be specific, honest, and not fabricate any company or candidate facts.
 * (Prompt-builder pattern — see cv-extraction.ts for the full explanation.)
 */
export function buildCoverLetterPrompt(
  cv: ParsedCV,
  job: ParsedJob,
  tailoredCV: TailoredCV,
  userAnswers: UserAnswer[]
): string {
  const answersSection =
    userAnswers.length > 0
      ? `\nCANDIDATE ADDITIONAL INFORMATION:
---
${userAnswers.map((a) => `${a.questionId}: ${a.answer}`).join('\n')}
---`
      : '';

  const candidateName = cv.candidate.name || 'The candidate';
  const jobTitle = job.jobTitle || 'this role';
  const company = job.company || 'your company';

  return `You are an expert cover letter writer. Write a professional, specific cover letter for this job application.

RULES:
1. Do NOT fabricate any candidate information not present in the CV or user answers.
2. Do NOT invent company facts — only use information from the job advertisement.
3. Do NOT use generic, clichéd phrases like "I am a passionate team player with excellent communication skills".
4. Be specific — mention actual experience, actual projects, actual skills from the CV.
5. Keep it professional, concise and compelling (3-4 paragraphs).
6. Address it to the hiring team at ${company} for the role of ${jobTitle}.
7. If the company name or hiring manager name is unknown, use appropriate generic forms.
8. The letter should feel specifically written for THIS job, not a template.

CANDIDATE: ${candidateName}
${answersSection}

CANDIDATE CV SUMMARY:
---
${JSON.stringify(tailoredCV, null, 2)}
---

JOB DETAILS:
---
${JSON.stringify(job, null, 2)}
---

Write the cover letter in plain text format (no markdown, no headers except for address block). Structure:
- Opening: Why this specific role at this specific company interests the candidate (based only on available information)
- Body paragraph 1: Most relevant experience that directly addresses the job requirements
- Body paragraph 2: Specific skills, projects or achievements that add value
- Closing: Clear, professional call to action

Return a JSON object:
{
  "content": "The full cover letter text"
}

Return ONLY the JSON object.`;
}
