# CV Tailor 🎯

**CV Tailor** is an AI-powered web application that helps job seekers instantly tailor their existing CV and generate a custom cover letter for specific job advertisements. 

Instead of starting from scratch or sending generic applications, CV Tailor analyzes your professional experience and intelligently aligns it with the exact requirements of your target role.

### 💡 Core Principle: Truthfulness Over Completeness
Unlike many AI resume builders that hallucinate or exaggerate skills, CV Tailor operates on a strict rule: **never invent information**. The AI is strictly instructed to only reorganize, emphasize, and improve the presentation of the experience *actually present* in your original CV. If critical information is missing, the application will pause and ask you targeted clarification questions rather than making assumptions.

---

## ✨ Features
- **Smart CV Extraction:** Upload your existing CV in PDF or DOCX format, and the system extracts and structures your experience automatically.
- **Job Ad Scraping:** Simply paste a URL to a job advertisement. The system extracts the core responsibilities and requirements, bypassing ads and clutter (includes a manual paste fallback for bot-protected job boards).
- **Gap Analysis & Interactive Q&A:** The AI compares your CV to the job ad. If it finds missing requirements that you might actually possess but forgot to list, it asks you follow-up questions to gather that context.
- **Tailored Output:** Generates a highly targeted, professional CV and matching Cover Letter optimized for the specific role.
- **Client-Side PDF Generation:** High-quality, ATS-friendly A4 PDFs are generated entirely in your browser using a clean, modern template.
- **Privacy First:** No accounts, no database, no tracking. Your documents are processed server-side in memory and never saved to a database.

---

## 🛠️ Tech Stack
- **Framework:** Next.js (App Router) + React 19
- **Styling:** Tailwind CSS + shadcn/ui (Lucide icons)
- **AI Engine:** Google Gemini API (`gemini-2.0-flash`) with structured JSON outputs.
- **Document Parsing:** `pdf-parse` (PDF) and `mammoth` (DOCX).
- **Web Scraping:** Mozilla Readability + JSDOM.
- **Data Validation:** Zod schemas to ensure strict, safe AI responses.
- **PDF Generation:** `@react-pdf/renderer`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- A Google Gemini API key (Get one free at [Google AI Studio](https://aistudio.google.com/))

### Installation
1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/cv-tailor.git
   cd cv-tailor
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure your environment:
   Copy the example environment file and add your Gemini API key:
   ```bash
   cp .env.example .env.local
   ```
   Open `.env.local` and set:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```
   Navigate to `http://localhost:3000` to start tailoring your applications!

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
