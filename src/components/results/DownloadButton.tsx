// ─────────────────────────────────────────────────────────────────────────────
// DOWNLOAD BUTTON — generates a PDF (CV or cover letter) and downloads it.
//
// PDF generation is heavy and browser-only, so we lazy-import the generator
// only when the user clicks (see the dynamic `await import(...)` below). This
// keeps it out of the initial page bundle and avoids server-side-render issues.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useState } from 'react';
import { Download, Loader2 } from 'lucide-react';
import type { TailoredCV, CoverLetter } from '@/types';

interface DownloadButtonProps {
  type: 'cv' | 'coverletter'; // Which document to build
  // `data` is a UNION: its shape depends on `type`. Each variant carries the
  // right payload plus the shared metadata fields.
  data:
    | { tailoredCV: TailoredCV; candidateName: string; jobTitle: string; company: string }
    | { coverLetter: CoverLetter; candidateName: string; jobTitle: string; company: string };
  fileName: string;
}

export function DownloadButton({ type, data, fileName }: DownloadButtonProps) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    try {
      // Dynamically import PDF generation to avoid SSR issues and shrink the bundle.
      // `await import(...)` loads the module on demand and returns its exports.
      if (type === 'cv') {
        const { generateCVPDF } = await import('@/lib/services/pdf-generator');
        const blob = await generateCVPDF(
          // `as {...}` is a type ASSERTION: we promise the compiler this union
          // member is the CV variant (safe here because we're inside the 'cv' branch).
          data as {
            tailoredCV: TailoredCV;
            candidateName: string;
            jobTitle: string;
            company: string;
          }
        );
        downloadBlob(blob, sanitizeFileName(fileName));
      } else {
        const { generateCoverLetterPDF } = await import('@/lib/services/pdf-generator');
        const blob = await generateCoverLetterPDF(
          data as {
            coverLetter: CoverLetter;
            candidateName: string;
            jobTitle: string;
            company: string;
          }
        );
        downloadBlob(blob, sanitizeFileName(fileName));
      }
    } catch (error) {
      console.error('PDF generation failed:', error);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading}
      className="flex items-center gap-2 bg-zinc-900 text-white text-sm font-medium rounded-lg px-4 py-2.5 hover:bg-zinc-700 disabled:opacity-60 disabled:cursor-not-allowed transition-colors"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <Download className="w-4 h-4" />
      )}
      {loading
        ? 'Generating PDF...'
        : type === 'cv'
        ? 'Download CV (PDF)'
        : 'Download Cover Letter (PDF)'}
    </button>
  );
}

// Trigger a browser download of a Blob (binary data) by creating a temporary
// <a download> link and "clicking" it programmatically — the standard trick since
// JS can't write files directly. We revoke the object URL afterward to free memory.
function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);          // Make a temporary in-memory URL
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;                        // The `download` attr forces a save
  document.body.appendChild(link);
  link.click();                                    // Programmatic click starts the download
  document.body.removeChild(link);
  URL.revokeObjectURL(url);                        // Release the memory
}

// Clean a user-facing string into a safe file name: strip odd characters,
// turn spaces into dashes, lowercase, and cap the length.
function sanitizeFileName(name: string): string {
  return name
    .replace(/[^a-z0-9.\-_\s]/gi, '') // Remove anything not alphanumeric/.-_/space
    .replace(/\s+/g, '-')             // Collapse whitespace runs into single dashes
    .toLowerCase()
    .slice(0, 100);                   // Hard cap at 100 chars
}
