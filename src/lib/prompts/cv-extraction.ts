/**
 * Prompt for extracting structured CV data from raw text.
 * TRUTHFULNESS: Extract ONLY what is explicitly present. Never infer or add.
 *
 * A "prompt builder" is just a function that returns a big instruction STRING for
 * the AI. Keeping prompts in their own files (instead of inline) makes them easy
 * to read, tweak, and reuse. The `\`...\`` is a template literal — a multi-line
 * string where `${cvText}` injects the user's CV at the end. The detailed rules +
 * the exact JSON schema example are what make the AI return predictable JSON.
 */
export function buildCVExtractionPrompt(cvText: string): string {
  return `You are a precise CV parser. Your ONLY job is to extract information that is EXPLICITLY present in the CV text below.

CRITICAL RULES:
1. Extract ONLY information that is literally written in the CV.
2. Do NOT infer, guess, or add ANY information that is not explicitly stated.
3. If a field is not present in the CV, return an empty string or empty array.
4. Do NOT make up skills, technologies, dates, titles, or any other information.
5. Do NOT "complete" partial information — if a date is missing, leave it empty.

Return your response as a valid JSON object matching this exact schema:
{
  "candidate": {
    "name": "string (full name if present, otherwise empty string)",
    "email": "string",
    "phone": "string",
    "location": "string",
    "links": ["array of URLs, LinkedIn, GitHub, portfolio etc"]
  },
  "summary": "string (professional summary/objective if present, otherwise empty)",
  "experience": [
    {
      "jobTitle": "string",
      "employer": "string",
      "location": "string",
      "startDate": "string (as written in CV)",
      "endDate": "string (as written or 'Present')",
      "current": false,
      "responsibilities": ["array of bullet points / responsibilities"],
      "achievements": ["array of measurable achievements if explicitly stated"],
      "technologies": ["array of tools/tech mentioned in this role"]
    }
  ],
  "education": [
    {
      "degree": "string",
      "institution": "string",
      "location": "string",
      "startDate": "string",
      "endDate": "string",
      "grade": "string (GPA or grade if stated)",
      "notes": "string (honours, distinctions, relevant modules if stated)"
    }
  ],
  "skills": ["flat array of all explicitly listed skills"],
  "certifications": [
    {
      "name": "string",
      "issuer": "string",
      "date": "string",
      "expiryDate": "string"
    }
  ],
  "languages": ["array of languages mentioned"],
  "projects": [
    {
      "name": "string",
      "description": "string",
      "technologies": ["array"],
      "url": "string",
      "highlights": ["array of key outcomes"]
    }
  ],
  "achievements": ["array of standalone achievements not tied to a specific role"]
}

CV TEXT TO PARSE:
---
${cvText}
---

Return ONLY the JSON object. No commentary, no markdown fences, no explanation.`;
}
