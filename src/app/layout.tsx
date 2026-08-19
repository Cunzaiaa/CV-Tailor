// ─────────────────────────────────────────────────────────────────────────────
// ROOT LAYOUT — the outermost HTML shell for every page in the app.
//
// In Next.js (App Router), `layout.tsx` is special: it wraps ALL pages/routes.
// Think of it like a base JSP template or a Spring `@ControllerAdvice` layout —
// shared HTML (<html>, <body>, fonts, global CSS) lives here once, and each
// page is injected as `children`. This is a SERVER component by default
// (runs on the server, no browser JS), which is why it can safely set metadata.
// ─────────────────────────────────────────────────────────────────────────────
import type { Metadata } from 'next';
import { Geist } from 'next/font/google'; // Next's built-in Google Fonts loader (self-hosts the font for speed)
import './globals.css'; // Global stylesheet — imported ONCE here so it applies everywhere

// Load the "Geist" font and expose it as a CSS variable (--font-geist-sans).
// `variable` lets Tailwind reference it via font-family utilities.
const geist = Geist({
  subsets: ['latin'], // Only download the Latin character set (smaller file)
  variable: '--font-geist-sans',
});

// `metadata` is Next's declarative way to set <title>, <meta> and Open Graph tags.
// Next reads this export and renders the <head> for you — no manual <head> editing.
// Roughly analogous to setting page title/SEO tags in a server-rendered template.
export const metadata: Metadata = {
  title: 'AI CV Tailor — Create a CV That Fits the Job',
  description:
    'Tailor your CV and cover letter to any job opportunity using AI. Upload your CV, add the job description and create a professional, personalized application.',
  keywords: [
    'CV tailor',
    'resume tailor',
    'AI CV',
    'cover letter generator',
    'job application',
    'ATS resume',
    'tailored resume',
  ],
  openGraph: {
    title: 'AI CV Tailor — Create a CV That Fits the Job',
    description:
      'Upload your CV, paste the job advertisement, and get a professionally tailored CV and cover letter — without starting from scratch.',
    type: 'website',
  },
};

// The default-exported React component named `RootLayout` is what Next renders
// as the app shell. `children` is the current page's content (injected by Next).
export default function RootLayout({
  children,
}: {
  children: React.ReactNode; // React's type for "anything renderable" (elements, text, etc.)
}) {
  return (
    // Attach the font CSS variable to <html> so the whole document can use it.
    <html lang="en" className={geist.variable}>
      {/* Tailwind utility classes set the base look: system sans font, smooth text,
          white background, near-black text, and a full-height page. */}
      <body className="font-sans antialiased bg-zinc-50 text-zinc-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}
