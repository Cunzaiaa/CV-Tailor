// ─────────────────────────────────────────────────────────────────────────────
// QUESTIONS STEP — shown only when the AI needs clarification before tailoring.
//
// It renders a dynamic list of AI-generated questions, collects the user's answers
// in local state, validates that all are answered, then sends them back to the
// parent via `onSubmit` (which re-runs the analysis WITH the answers).
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useState } from 'react';
import { HelpCircle } from 'lucide-react';
import type { MatchQuestion, UserAnswer } from '@/types';

interface QuestionsStepProps {
  questions: MatchQuestion[];               // The questions the AI wants answered
  onSubmit: (answers: UserAnswer[]) => void; // Callback to send answers to the parent
}

export function QuestionsStep({ questions, onSubmit }: QuestionsStepProps) {
  // Store answers as a map of questionId → answer text.
  // `Record<string, string>` is TS for "an object with string keys and string values".
  // Object.fromEntries turns [[id, ''], ...] into { id: '', ... } — one empty slot per question.
  const [answers, setAnswers] = useState<Record<string, string>>(
    Object.fromEntries(questions.map((q) => [q.id, '']))
  );
  const [error, setError] = useState<string | null>(null);

  // Update one answer. `{ ...prev, [id]: value }` copies the existing map and
  // overwrites just this key — React state must be replaced immutably, never mutated.
  const handleChange = (id: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [id]: value }));
    setError(null);
  };

  const handleSubmit = () => {
    // Require every question to have a non-empty answer.
    const unanswered = questions.filter((q) => !answers[q.id]?.trim());
    if (unanswered.length > 0) {
      setError(
        `Please answer all questions before continuing. ${unanswered.length} question${unanswered.length > 1 ? 's' : ''} still need${unanswered.length === 1 ? 's' : ''} an answer.`
      );
      return;
    }

    // Reshape the map into the array of {questionId, answer} the API expects.
    const userAnswers: UserAnswer[] = questions.map((q) => ({
      questionId: q.id,
      answer: answers[q.id].trim(),
    }));

    onSubmit(userAnswers);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h2 className="text-lg font-semibold text-zinc-900">
          Before we create your application
        </h2>
        <p className="text-sm text-zinc-500 leading-relaxed">
          To build the best possible tailored CV and cover letter, we have a few targeted
          questions. Your answers help us represent your experience accurately without
          making assumptions.
        </p>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((q, index) => (
          <div key={q.id} className="space-y-2">
            <label
              htmlFor={q.id}
              className="block text-sm font-medium text-zinc-700"
            >
              <span className="text-zinc-400 font-normal mr-1.5">{index + 1}.</span>
              {q.question}
            </label>

            {q.reason && (
              <div className="flex items-start gap-1.5 text-xs text-zinc-400">
                <HelpCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                <span>{q.reason}</span>
              </div>
            )}

            <textarea
              id={q.id}
              value={answers[q.id] ?? ''}
              onChange={(e) => handleChange(q.id, e.target.value)}
              placeholder="Your answer..."
              rows={3}
              className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-zinc-300 resize-none"
            />
          </div>
        ))}
      </div>

      {error && (
        <div
          role="alert"
          className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
        >
          {error}
        </div>
      )}

      <div className="pt-2">
        <button
          onClick={handleSubmit}
          className="w-full bg-zinc-900 text-white font-medium rounded-xl px-6 py-3.5 hover:bg-zinc-700 transition-colors"
        >
          Continue — Generate my application
        </button>
        <p className="text-center text-xs text-zinc-400 mt-3">
          If you&apos;re unsure about any question, type &quot;Not applicable&quot; and we&apos;ll work with what we have.
        </p>
      </div>
    </div>
  );
}
