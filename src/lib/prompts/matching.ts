import type { ParsedCV, ParsedJob, UserAnswer } from '@/types';

/**
 * Prompt for matching CV against job requirements.
 * Produces a match score, strengths, gaps, and whether questions are needed.
 * This prompt takes structured OBJECTS (cv, job) — it JSON-stringifies them into
 * the prompt so the AI can compare them field by field.
 */
export function buildMatchingPrompt(
  cv: ParsedCV,
  job: ParsedJob,
  userAnswers?: UserAnswer[]
): string {
  const answersSection =
    userAnswers && userAnswers.length > 0
      ? `\nUSER-PROVIDED ADDITIONAL INFORMATION (from follow-up questions):
---
${userAnswers.map((a) => `Q: ${a.questionId}\nA: ${a.answer}`).join('\n\n')}
---
This information was voluntarily provided by the candidate and may be used to supplement the CV.`
      : '';

  return `You are an expert career advisor performing a detailed match analysis between a candidate's CV and a job advertisement.

IMPORTANT LANGUAGE RULES:
- A gap does NOT mean the candidate lacks a skill. It means the CV does not provide sufficient evidence.
- Use language like: "The CV does not provide evidence of X" NOT "The candidate lacks X".
- Only claim a skill is present if it is explicitly stated in the CV or user answers.
- A partial match means the candidate has related but not identical experience.

${answersSection}

CANDIDATE CV (structured):
---
${JSON.stringify(cv, null, 2)}
---

JOB REQUIREMENTS (structured):
---
${JSON.stringify(job, null, 2)}
---

Perform a thorough matching analysis and return a JSON object:
{
  "matchScore": number (0-100, realistic estimate of how well the CV aligns with the job based on available information),
  "strengths": [
    "array of specific areas where the candidate clearly matches the job requirements — cite specific experience or skills"
  ],
  "gaps": [
    "array of job requirements for which the CV does not provide sufficient evidence — use careful language, do not say 'candidate lacks'"
  ],
  "importantNotes": [
    "array of important observations e.g. transferable skills, career trajectory, relevant context"
  ],
  "needsQuestions": boolean (true if asking 3-7 targeted questions would significantly improve the application quality),
  "questions": [
    {
      "id": "q1",
      "question": "Specific, targeted question to the candidate",
      "reason": "Why this question matters for this application",
      "relatedRequirement": "The specific job requirement this addresses"
    }
  ]
}

QUESTION GUIDELINES (only if needsQuestions is true):
- Limit to 3-7 questions maximum.
- Questions must be specific, actionable and directly tied to a job requirement.
- Do NOT ask generic questions like "Tell us about yourself".
- Example: "Have you used Python in professional, academic or personal projects? If yes, describe a specific example."
- If needsQuestions is false, return an empty array for questions.

Return ONLY the JSON object.`;
}
