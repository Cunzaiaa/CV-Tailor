// ─────────────────────────────────────────────────────────────────────────────
// COVER LETTER TAB — shows the generated cover letter text + a download button.
//
// The AI returns the letter as one plain string. `whitespace-pre-wrap` (in the JSX)
// preserves the line breaks and paragraphs exactly as generated.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import type { CoverLetter } from '@/types';
import { DownloadButton } from './DownloadButton';

interface CoverLetterTabProps {
  coverLetter: CoverLetter;
  candidateName: string;
  jobTitle: string;
  company: string;
}

export function CoverLetterTab({
  coverLetter,
  candidateName,
  jobTitle,
  company,
}: CoverLetterTabProps) {
  // Bundle props for the PDF download button.
  const clData = { coverLetter, candidateName, jobTitle, company };

  return (
    <div className="space-y-6">
      {/* Download button */}
      <div className="flex justify-end">
        <DownloadButton
          type="coverletter"
          data={clData}
          fileName={`${candidateName || 'cover-letter'}-${company || 'application'}.pdf`}
        />
      </div>

      {/* Cover Letter Preview */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-8 shadow-sm">
        <div className="max-w-2xl mx-auto">
          <div
            className="text-sm text-zinc-700 leading-relaxed whitespace-pre-wrap font-['Georgia',serif]"
            style={{ lineHeight: '1.8' }}
          >
            {coverLetter.content}
          </div>
        </div>
      </div>
    </div>
  );
}
