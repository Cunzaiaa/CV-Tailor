/**
 * PDF Generator — client-side only (uses @react-pdf/renderer).
 * IMPORTANT: This file uses JSX — must be .tsx extension.
 * Only import dynamically from client components.
 *
 * Key idea: @react-pdf/renderer lets us DESCRIBE a PDF using React components
 * (<Document>, <Page>, <Text>, <View>) instead of drawing coordinates. It's
 * like building a webpage, but the output is a PDF file. <View> ≈ <div>,
 * <Text> ≈ <span>, and styles use a Flexbox-like subset (see StyleSheet below).
 */
import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
  Font,
} from '@react-pdf/renderer';
import type { TailoredCV, CoverLetter } from '@/types';

// Register a web font so the PDF isn't stuck with the default. @react-pdf downloads
// these .woff2 files and embeds the glyphs it needs into the generated PDF.
Font.register({
  family: 'Inter',
  fonts: [
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiA.woff2',
      fontWeight: 400,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiA.woff2',
      fontWeight: 600,
    },
    {
      src: 'https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiA.woff2',
      fontWeight: 700,
    },
  ],
});

// `S` is our stylesheet. StyleSheet.create defines named style objects (like CSS
// classes) that we attach to elements via `style={S.name}`. Note these are
// JS objects, not CSS strings — camelCase keys, numbers for sizes.
const S = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10,
    color: '#18181b',
    paddingTop: 48,
    paddingBottom: 48,
    paddingHorizontal: 52,
    lineHeight: 1.5,
  },
  name: { fontSize: 20, fontWeight: 700, color: '#09090b', marginBottom: 8 },
  summary: {
    fontSize: 10,
    color: '#52525b',
    lineHeight: 1.6,
    marginBottom: 20,
    paddingBottom: 16,
    borderBottomColor: '#e4e4e7',
    borderBottomWidth: 1,
  },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontSize: 7,
    fontWeight: 700,
    color: '#a1a1aa',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 10,
  },
  expHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  jobTitle: { fontSize: 10, fontWeight: 600, color: '#09090b' },
  employer: { fontSize: 10, color: '#52525b' },
  dateText: { fontSize: 9, color: '#a1a1aa', textAlign: 'right' },
  bullet: { fontSize: 9.5, color: '#3f3f46', marginBottom: 2, paddingLeft: 12, lineHeight: 1.5 },
  techRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: 4 },
  tech: { fontSize: 8, color: '#71717a', backgroundColor: '#f4f4f5', paddingHorizontal: 5, paddingVertical: 2, borderRadius: 3 },
  expItem: { marginBottom: 12 },
  skillsWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 5 },
  skillPill: { fontSize: 9, color: '#3f3f46', borderColor: '#e4e4e7', borderWidth: 1, borderRadius: 50, paddingHorizontal: 8, paddingVertical: 3 },
  simple: { fontSize: 9.5, color: '#3f3f46', marginBottom: 3, lineHeight: 1.5 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
});

// ── CV Document ───────────────────────────────────────────────────────────────

interface CVDocProps { tailoredCV: TailoredCV; candidateName: string; }

function CVDocument({ tailoredCV, candidateName }: CVDocProps) {
  return (
    <Document title={`${candidateName} — Tailored CV`} author="CV Tailor">
      <Page size="A4" style={S.page}>
        <Text style={S.name}>{candidateName || 'Candidate'}</Text>

        {tailoredCV.summary ? <Text style={S.summary}>{tailoredCV.summary}</Text> : null}

        {/* Experience */}
        {tailoredCV.experience.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Experience</Text>
            {tailoredCV.experience.map((exp, i) => (
              <View key={i} style={S.expItem}>
                <View style={S.expHeader}>
                  <View>
                    <Text style={S.jobTitle}>{exp.jobTitle}</Text>
                    <Text style={S.employer}>{exp.employer}</Text>
                  </View>
                  <View>
                    <Text style={S.dateText}>
                      {exp.startDate}{exp.endDate ? ` — ${exp.endDate}` : ' — Present'}
                    </Text>
                    {exp.location ? <Text style={S.dateText}>{exp.location}</Text> : null}
                  </View>
                </View>
                {exp.responsibilities.map((r, j) => (
                  <Text key={j} style={S.bullet}>{'• '}{r}</Text>
                ))}
                {exp.technologies.length > 0 && (
                  <View style={S.techRow}>
                    {exp.technologies.map((t, j) => <Text key={j} style={S.tech}>{t}</Text>)}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Education */}
        {tailoredCV.education.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Education</Text>
            {tailoredCV.education.map((edu, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <View style={S.row}>
                  <View>
                    <Text style={S.jobTitle}>{edu.degree}</Text>
                    <Text style={S.employer}>{edu.institution}</Text>
                    {edu.grade ? <Text style={S.simple}>{edu.grade}</Text> : null}
                  </View>
                  <Text style={S.dateText}>
                    {edu.startDate && edu.endDate ? `${edu.startDate} — ${edu.endDate}` : edu.endDate || edu.startDate}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Skills */}
        {tailoredCV.skills.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Skills</Text>
            <View style={S.skillsWrap}>
              {tailoredCV.skills.map((s, i) => <Text key={i} style={S.skillPill}>{s}</Text>)}
            </View>
          </View>
        )}

        {/* Certifications */}
        {tailoredCV.certifications.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Certifications</Text>
            {tailoredCV.certifications.map((c, i) => <Text key={i} style={S.simple}>{'• '}{c}</Text>)}
          </View>
        )}

        {/* Languages */}
        {tailoredCV.languages.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Languages</Text>
            <Text style={S.simple}>{tailoredCV.languages.join(' · ')}</Text>
          </View>
        )}

        {/* Projects */}
        {tailoredCV.projects.length > 0 && (
          <View style={S.section}>
            <Text style={S.sectionTitle}>Projects</Text>
            {tailoredCV.projects.map((p, i) => (
              <View key={i} style={{ marginBottom: 8 }}>
                <Text style={S.jobTitle}>{p.name}</Text>
                {p.description ? <Text style={S.simple}>{p.description}</Text> : null}
                {p.technologies.length > 0 && (
                  <View style={S.techRow}>
                    {p.technologies.map((t, j) => <Text key={j} style={S.tech}>{t}</Text>)}
                  </View>
                )}
              </View>
            ))}
          </View>
        )}
      </Page>
    </Document>
  );
}

// ── Cover Letter Document ─────────────────────────────────────────────────────

const CLS = StyleSheet.create({
  page: {
    fontFamily: 'Inter',
    fontSize: 10.5,
    color: '#18181b',
    paddingTop: 64,
    paddingBottom: 64,
    paddingHorizontal: 72,
    lineHeight: 1.9,
  },
  content: { fontSize: 10.5, color: '#3f3f46', lineHeight: 1.9 },
});

interface CLDocProps {
  coverLetter: CoverLetter;
  candidateName: string;
  jobTitle: string;
  company: string;
}

function CoverLetterDocument({ coverLetter, candidateName, jobTitle, company }: CLDocProps) {
  return (
    <Document
      title={`${candidateName} — Cover Letter — ${jobTitle} at ${company}`}
      author="CV Tailor"
    >
      <Page size="A4" style={CLS.page}>
        <Text style={CLS.content}>{coverLetter.content}</Text>
      </Page>
    </Document>
  );
}

// ── Public API ────────────────────────────────────────────────────────────────

// Public entry point: build the CV document and render it to a Blob (binary file)
// that the browser can download. `pdf(element).toBlob()` does the rendering.
export async function generateCVPDF(data: {
  tailoredCV: TailoredCV;
  candidateName: string;
  jobTitle: string;
  company: string;
}): Promise<Blob> {
  const element = (
    <CVDocument
      tailoredCV={data.tailoredCV}
      candidateName={data.candidateName}
    />
  );
  return await pdf(element).toBlob();
}

// Same idea for the cover letter document.
export async function generateCoverLetterPDF(data: {
  coverLetter: CoverLetter;
  candidateName: string;
  jobTitle: string;
  company: string;
}): Promise<Blob> {
  const element = (
    <CoverLetterDocument
      coverLetter={data.coverLetter}
      candidateName={data.candidateName}
      jobTitle={data.jobTitle}
      company={data.company}
    />
  );
  return await pdf(element).toBlob();
}
