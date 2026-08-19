// ─────────────────────────────────────────────────────────────────────────────
// UPLOAD STEP — the "Step 1: Upload your CV" card.
//
// Responsibilities:
//   1. Accept a PDF/DOCX via drag-and-drop OR let the user paste raw text.
//   2. Send the file/text to our backend (/api/parse-cv) to extract plain text.
//   3. Report the extracted text back to the parent via the `onCVReady` callback.
//
// The parent (page.tsx) owns the CV text; this component just produces it and
// "lifts" it up. That one-way data flow (child → parent via callback) is the
// standard React pattern for child-to-parent communication.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone'; // 3rd-party hook giving drag-and-drop behavior
import { Upload, FileText, X, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils'; // Tiny helper to merge Tailwind class strings conditionally

// PROPS = the inputs a component receives from its parent (like constructor args).
// Here the only prop is a callback the parent passes in to receive the CV text.
interface UploadStepProps {
  onCVReady: (text: string, fileName: string) => void;
}

// The `{ onCVReady }` syntax is object DESTRUCTURING — it pulls the `onCVReady`
// field out of the props object into a local variable.
export function UploadStep({ onCVReady }: UploadStepProps) {
  // Local UI state that only THIS component cares about (parent doesn't need it).
  const [uploading, setUploading] = useState(false);          // Show a spinner while parsing
  const [uploadedFile, setUploadedFile] = useState<string | null>(null); // Name once done
  const [error, setError] = useState<string | null>(null);    // Inline error message
  const [showPaste, setShowPaste] = useState(false);          // Toggle drag-drop vs paste box
  const [pastedText, setPastedText] = useState('');           // Text in the paste box

  // Upload a File object to the backend and get extracted text back.
  const processFile = useCallback(
    async (file: File) => {
      setUploading(true);
      setError(null);

      // FormData is the browser's multipart/form-data builder — the correct way to
      // send a binary file over HTTP (Content-Type is set automatically).
      const formData = new FormData();
      formData.append('cv', file); // 'cv' is the field name the server reads

      try {
        const res = await fetch('/api/parse-cv', {
          method: 'POST',
          body: formData, // Note: no manual Content-Type header for FormData
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.error ?? 'Failed to process file.');
          return;
        }

        setUploadedFile(file.name);
        onCVReady(data.text, data.fileName); // Hand the extracted text up to the parent
      } catch {
        setError('Network error. Please check your connection and try again.');
      } finally {
        setUploading(false); // Always stop the spinner, success or failure
      }
    },
    [onCVReady]
  );

  // react-dropzone calls this with the files the user dropped/selected.
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        processFile(acceptedFiles[0]); // We only handle the first file
      }
    },
    [processFile]
  );

  // useDropzone wires up all the drag-and-drop plumbing and returns prop-getters
  // we spread onto our elements below, plus `isDragActive` for styling.
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      // Map of allowed MIME types → file extensions the picker should show.
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/msword': ['.doc'],
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB (in bytes)
    onDropRejected: (fileRejections) => {
      // Translate the library's error into a friendly message.
      const reason = fileRejections[0]?.errors[0]?.message ?? 'File rejected.';
      if (reason.includes('size')) {
        setError('File is too large. Maximum size is 5MB.');
      } else if (reason.includes('type')) {
        setError('Unsupported file type. Please upload a PDF or DOCX file.');
      } else {
        setError(reason);
      }
    },
  });

  // Alternative path: user pasted raw CV text instead of uploading a file.
  const handlePasteSubmit = async () => {
    if (!pastedText.trim()) {
      setError('Please paste your CV text.');
      return;
    }
    setUploading(true);
    setError(null);

    try {
      // Same endpoint, but this time we send JSON (text) instead of a file.
      const res = await fetch('/api/parse-cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: pastedText }),
      });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error ?? 'Failed to process text.');
        return;
      }

      setUploadedFile('Pasted CV');
      onCVReady(data.text, 'pasted-cv.txt');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  // Clear everything back to the initial "no CV yet" state.
  const reset = () => {
    setUploadedFile(null);
    setError(null);
    setPastedText('');
    setShowPaste(false);
  };

  return (
    <div className="space-y-4">
      {/* Card heading with the step number badge. */}
      <div className="flex items-center gap-2.5">
        <span className="w-6 h-6 shrink-0 rounded-lg bg-brand-gradient text-white text-xs font-bold flex items-center justify-center shadow-glow">
          1
        </span>
        <div>
          <h2 className="text-sm font-semibold text-zinc-800">Upload your CV</h2>
          <p className="text-xs text-zinc-400">PDF or DOCX, up to 5MB</p>
        </div>
      </div>

      {/* Ternary: if no file yet → show the uploader; otherwise → show the "done" chip.
          `cond ? <A/> : <B/>` is the standard way to pick between two JSX branches. */}
      {!uploadedFile ? (
        <>
          {!showPaste ? (
            // Drag-and-drop zone. `{...getRootProps()}` spreads the event handlers
            // react-dropzone gave us onto this div (onClick, onDrop, etc.).
            <div
              {...getRootProps()}
              className={cn(
                'relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-200',
                isDragActive
                  ? 'border-violet-400 bg-violet-50/70 scale-[1.01]'
                  : 'border-zinc-200 hover:border-violet-300 hover:bg-violet-50/30',
                uploading && 'pointer-events-none opacity-60'
              )}
            >
              <input {...getInputProps()} />
              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    'w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-200',
                    isDragActive
                      ? 'bg-brand-gradient shadow-glow'
                      : 'bg-violet-100'
                  )}
                >
                  <Upload
                    className={cn(
                      'w-5 h-5 transition-colors',
                      isDragActive ? 'text-white' : 'text-violet-500'
                    )}
                  />
                </div>
                {uploading ? (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-600">Reading your CV...</p>
                    <div className="w-32 h-1 bg-zinc-100 rounded-full mx-auto overflow-hidden">
                      <div className="h-full bg-brand-gradient rounded-full animate-progress" />
                    </div>
                  </div>
                ) : isDragActive ? (
                  <p className="text-sm font-medium text-violet-600">Drop your CV here</p>
                ) : (
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-zinc-700">
                      Drag & drop your CV here
                    </p>
                    <p className="text-xs text-zinc-400">or click to browse files</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <textarea
                value={pastedText}
                onChange={(e) => setPastedText(e.target.value)}
                placeholder="Paste your full CV text here..."
                rows={10}
                className="w-full border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-700 placeholder:text-zinc-300 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-violet-300 resize-none transition-shadow"
              />
              <div className="flex gap-2">
                <button
                  onClick={handlePasteSubmit}
                  disabled={uploading || !pastedText.trim()}
                  className="flex-1 bg-brand-gradient text-white text-sm font-medium rounded-lg px-4 py-2.5 shadow-glow hover:-translate-y-0.5 disabled:opacity-40 disabled:shadow-none disabled:hover:translate-y-0 disabled:cursor-not-allowed transition-all duration-200"
                >
                  {uploading ? 'Processing...' : 'Use this CV'}
                </button>
                <button
                  onClick={() => setShowPaste(false)}
                  className="px-4 py-2.5 text-sm text-zinc-500 hover:text-zinc-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {!showPaste && (
            <button
              onClick={() => setShowPaste(true)}
              className="text-xs text-zinc-400 hover:text-violet-600 underline underline-offset-2 transition-colors"
            >
              Or paste your CV text instead
            </button>
          )}
        </>
      ) : (
        <div className="flex items-center gap-3 border border-violet-100 rounded-xl px-4 py-3 bg-violet-50/60">
          <div className="w-8 h-8 rounded-lg bg-brand-gradient flex items-center justify-center shrink-0 shadow-glow">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-zinc-700 truncate">{uploadedFile}</p>
            <p className="text-xs text-violet-500 font-medium">Ready</p>
          </div>
          <button
            onClick={reset}
            aria-label="Remove CV"
            className="text-zinc-300 hover:text-zinc-500 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex items-start gap-2 text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5"
        >
          <AlertCircle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
