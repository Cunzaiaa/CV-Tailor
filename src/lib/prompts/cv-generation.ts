import type { ParsedCV, ParsedJob, UserAnswer } from '@/types';

/**
 * Prompt for generating a professional, tailored CV.
 * ABSOLUTE RULE: Do not invent any information. Only use what is in the CV and user answers.
 * (Prompt-builder pattern — see cv-extraction.ts for the full explanation.)
 */
export function buildCVGenerationPrompt(
  cv: ParsedCV,
  job: ParsedJob,
  userAnswers: UserAnswer[]
): string {
  const answersSection =
    userAnswers.length > 0
      ? `\nCANDIDATE-PROVIDED ADDITIONAL INFORMATION:
---
${userAnswers.map((a) => `Question ID: ${a.questionId}\nAnswer: ${a.answer}`).join('\n\n')}
---
You MAY use this information to supplement the CV. Clearly treat it as additional candidate information.`
      : '';

  return `You are an expert CV writer. Your job is to rewrite and tailor the candidate's CV to maximise its relevance for the target job.

ABSOLUTE RULES — VIOLATING THESE WOULD HARM THE CANDIDATE:
1. You must NEVER invent, fabricate or add ANY of the following:
   - Work experience, employers, job titles, dates
   - Education, degrees, certifications, qualifications
   - Skills, technologies, languages
   - Achievements, metrics, responsibilities
   - Projects, URLs, names
2. You may ONLY use information that is present in the ORIGINAL CV or CANDIDATE-PROVIDED ADDITIONAL INFORMATION.
3. You MAY: improve wording, restructure bullets, emphasise relevance, use ATS-friendly terminology, remove less relevant items.
4. You MAY align terminology with the job description IF the underlying fact is present in the CV (e.g. if CV says "built REST APIs" and the job mentions "API development", you may use the job's phrasing).
5. If a job requirement is NOT met by the candidate's information, do not claim it is met.
6. Do NOT change dates, job titles, employer names or any factual information.
7. Maintain strict chronological accuracy.

${answersSection}

ORIGINAL CV:
---
${JSON.stringify(cv, null, 2)}
---

TARGET JOB:
---
${JSON.stringify(job, null, 2)}
---

Generate a tailored CV and return a JSON object:
{
  "summary": "2-4 sentence professional summary tailored to this role, using only information from the CV and user answers",
  "experience": [
    {
      "jobTitle": "exact title from CV — do not change",
      "employer": "exact employer from CV — do not change",
      "location": "from CV",
      "startDate": "exact from CV — do not change",
      "endDate": "exact from CV — do not change",
      "current": boolean,
      "responsibilities": ["improved, relevant bullet points — only based on actual CV content"],
      "achievements": ["any actual achievements from CV — do not invent metrics"],
      "technologies": ["technologies actually mentioned for this role in the CV"]
    }
  ],
  "education": [
    {
      "degree": "exact from CV",
      "institution": "exact from CV",
      "location": "from CV",
      "startDate": "from CV",
      "endDate": "from CV",
      "grade": "from CV"
    }
  ],
  "skills": ["prioritised and relevant skills from CV and user answers — do not add new ones"],
  "certifications": ["list of certifications as strings"],
  "languages": ["from CV and user answers only"],
  "projects": [
    {
      "name": "from CV",
      "description": "improved description based on CV content only",
      "technologies": ["from CV"],
      "url": "from CV",
      "highlights": ["from CV only"]
    }
  ]
}

Focus on the most relevant experience for the target job. Omit or condense less relevant roles.
Return ONLY the JSON object.`;
}
