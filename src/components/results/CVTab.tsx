// ─────────────────────────────────────────────────────────────────────────────
// CV TAB — renders the tailored CV as an on-screen "document" preview.
//
// This is mostly presentational: it walks the structured `tailoredCV` object and
// renders each section (experience, education, skills, ...). Every section is
// wrapped in `{array.length > 0 && (...)}` so empty sections simply don't appear.
// The `.map()` calls turn arrays into repeated JSX — the core list-rendering idiom.
// ─────────────────────────────────────────────────────────────────────────────
'use client';

import type { TailoredCV } from '@/types';
import { DownloadButton } from './DownloadButton';
import { MapPin, Calendar, ExternalLink } from 'lucide-react';

interface CVTabProps {
  tailoredCV: TailoredCV;
  candidateName: string;
  jobTitle: string;
  company: string;
}

export function CVTab({ tailoredCV, candidateName, jobTitle, company }: CVTabProps) {
  // Bundle the props into one object to hand to the DownloadButton (PDF generator).
  const cvData = { tailoredCV, candidateName, jobTitle, company };

  return (
    <div className="space-y-6">
      {/* Download button */}
      <div className="flex justify-end">
        <DownloadButton
          type="cv"
          data={cvData}
          fileName={`${candidateName || 'tailored'}-cv-${company || 'application'}.pdf`}
        />
      </div>

      {/* CV Preview */}
      <div className="bg-white border border-zinc-100 rounded-2xl p-8 space-y-7 shadow-sm font-['Georgia',serif]">
        {/* Header */}
        <div className="border-b border-zinc-100 pb-6">
          <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
            {candidateName || 'Candidate'}
          </h1>
          {tailoredCV.summary && (
            <p className="text-sm text-zinc-600 leading-relaxed mt-3 max-w-2xl font-sans">
              {tailoredCV.summary}
            </p>
          )}
        </div>

        {/* Experience */}
        {tailoredCV.experience.length > 0 && (
          <section aria-label="Work Experience">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-sans">
              Experience
            </h2>
            <div className="space-y-6">
              {tailoredCV.experience.map((exp, i) => (
                <div key={i} className="space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-zinc-900 font-sans">{exp.jobTitle}</p>
                      <p className="text-sm text-zinc-600 font-sans">{exp.employer}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-zinc-400 font-sans flex items-center gap-1 justify-end">
                        <Calendar className="w-3 h-3" />
                        {exp.startDate}
                        {exp.endDate ? ` — ${exp.endDate}` : ' — Present'}
                      </p>
                      {exp.location && (
                        <p className="text-xs text-zinc-400 font-sans flex items-center gap-1 justify-end mt-0.5">
                          <MapPin className="w-3 h-3" />
                          {exp.location}
                        </p>
                      )}
                    </div>
                  </div>
                  {exp.responsibilities.length > 0 && (
                    <ul className="space-y-1 pl-4">
                      {exp.responsibilities.map((r, j) => (
                        <li
                          key={j}
                          className="text-sm text-zinc-600 list-disc list-outside font-sans leading-relaxed"
                        >
                          {r}
                        </li>
                      ))}
                    </ul>
                  )}
                  {exp.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {exp.technologies.map((t, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-xs text-zinc-500 font-sans"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Education */}
        {tailoredCV.education.length > 0 && (
          <section aria-label="Education">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-sans">
              Education
            </h2>
            <div className="space-y-3">
              {tailoredCV.education.map((edu, i) => (
                <div key={i} className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-semibold text-zinc-900 font-sans">{edu.degree}</p>
                    <p className="text-sm text-zinc-600 font-sans">{edu.institution}</p>
                    {edu.grade && (
                      <p className="text-xs text-zinc-400 font-sans">{edu.grade}</p>
                    )}
                  </div>
                  <p className="text-xs text-zinc-400 font-sans shrink-0">
                    {edu.startDate && edu.endDate
                      ? `${edu.startDate} — ${edu.endDate}`
                      : edu.endDate || edu.startDate}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Skills */}
        {tailoredCV.skills.length > 0 && (
          <section aria-label="Skills">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-sans">
              Skills
            </h2>
            <div className="flex flex-wrap gap-2">
              {tailoredCV.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-3 py-1 rounded-full bg-zinc-50 border border-zinc-200 text-sm text-zinc-700 font-sans"
                >
                  {skill}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Certifications */}
        {tailoredCV.certifications.length > 0 && (
          <section aria-label="Certifications">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-sans">
              Certifications
            </h2>
            <ul className="space-y-1">
              {tailoredCV.certifications.map((cert, i) => (
                <li key={i} className="text-sm text-zinc-600 font-sans">
                  {cert}
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Languages */}
        {tailoredCV.languages.length > 0 && (
          <section aria-label="Languages">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-sans">
              Languages
            </h2>
            <div className="flex flex-wrap gap-2">
              {tailoredCV.languages.map((lang, i) => (
                <span
                  key={i}
                  className="text-sm text-zinc-600 font-sans"
                >
                  {lang}{i < tailoredCV.languages.length - 1 ? ' ·' : ''}
                </span>
              ))}
            </div>
          </section>
        )}

        {/* Projects */}
        {tailoredCV.projects.length > 0 && (
          <section aria-label="Projects">
            <h2 className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-4 font-sans">
              Projects
            </h2>
            <div className="space-y-4">
              {tailoredCV.projects.map((proj, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-zinc-900 font-sans">{proj.name}</p>
                    {proj.url && (
                      <a
                        href={proj.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-zinc-400 hover:text-zinc-600"
                        aria-label={`View ${proj.name} project`}
                      >
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                  {proj.description && (
                    <p className="text-sm text-zinc-600 font-sans">{proj.description}</p>
                  )}
                  {proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1.5">
                      {proj.technologies.map((t, j) => (
                        <span
                          key={j}
                          className="px-2 py-0.5 rounded-md bg-zinc-50 border border-zinc-100 text-xs text-zinc-500 font-sans"
                        >
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
