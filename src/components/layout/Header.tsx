// ─────────────────────────────────────────────────────────────────────────────
// HEADER — the sticky top bar (logo + "Powered by Gemini" badge).
//
// This is a "presentational" component: it takes no props and just renders markup.
// A React component is simply a function that returns JSX. Note the NAMED export
// (`export function Header`) — the parent imports it as `{ Header }`. (Compare with
// page.tsx which uses `export default`.)
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import { FileText, Sparkles } from 'lucide-react'; // SVG icons, used as React components

export function Header() {
  return (
    // `sticky top-0 z-50` keeps the bar pinned to the top while the page scrolls.
    // `glass` is a custom utility (defined in globals.css) for the frosted look.
    <header className="glass border-b border-zinc-200/60 sticky top-0 z-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo links back to home. `group` lets children react to hover on the <a>. */}
        <a href="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-xl bg-brand-gradient flex items-center justify-center shadow-glow transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-3">
            <FileText className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-zinc-900 tracking-tight">
            CV <span className="text-gradient">Tailor</span>
          </span>
        </a>
        {/* Small "Powered by Gemini" pill on the right. */}
        <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-500 border border-zinc-200/80 bg-white/50 rounded-full px-3 py-1.5">
          <Sparkles className="w-3.5 h-3.5 text-violet-500" />
          <span>Powered by Gemini</span>
        </div>
      </div>
    </header>
  );
}
