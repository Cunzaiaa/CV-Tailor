/**
 * Gemini API client — server-side only.
 * NEVER import this from client-side code.
 * The API key is read from the GEMINI_API_KEY environment variable.
 */
import { GoogleGenAI } from '@google/genai';
import { stripJsonFences } from '@/lib/utils';

const GEMINI_MODEL = process.env.GEMINI_MODEL ?? 'gemini-3.6-flash';

function getClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      'GEMINI_API_KEY environment variable is not set. ' +
        'Please add it to your .env.local file.'
    );
  }
  return new GoogleGenAI({ apiKey });
}

/**
 * Send a prompt to Gemini and return the raw text response.
 * Throws a descriptive error if the API call fails.
 */
export async function geminiGenerate(prompt: string): Promise<string> {
  const client = getClient();

  try {
    // The core call to Google's Gemini API. `contents` is our prompt string.
    const response = await client.models.generateContent({
      model: GEMINI_MODEL,
      contents: prompt,
      config: {
        temperature: 0.2, // Low temperature for factual, consistent output
        maxOutputTokens: 8192,
      },
    });

    const text = response.text;
    if (!text) {
      throw new Error('Gemini returned an empty response.');
    }

    return stripJsonFences(text);
  } catch (error: unknown) {
    // Translate raw API errors into friendly, safe messages (and never leak the key).
    if (error instanceof Error) {
      // Don't expose raw API errors to callers — translate them
      if (error.message.includes('API_KEY_INVALID') || error.message.includes('PERMISSION_DENIED')) {
        throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
      }
      if (error.message.includes('RESOURCE_EXHAUSTED') || error.message.includes('429')) {
        throw new Error('Gemini rate limit reached. Please wait a moment and try again.');
      }
      if (error.message.includes('SAFETY')) {
        throw new Error('The content was blocked by Gemini safety filters. Please review your input.');
      }
      throw new Error(`AI processing failed: ${error.message}`);
    }
    throw new Error('An unexpected error occurred while contacting the AI service.');
  }
}

export { GEMINI_MODEL };
