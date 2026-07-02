# First-Run Walkthrough

You've installed Reeesume and opened [http://localhost:3000](http://localhost:3000). This guide takes you from an empty dashboard to your first tailored resume export in about 10 minutes.

---

## What you'll do

1. [Configure an AI provider](#step-1-configure-an-ai-provider) — required for any AI feature
2. [Build your MasterResume](#step-2-build-your-master-resume) — your permanent career database
3. [Create your first application](#step-3-create-your-first-application) — a vacancy + tailored resume + cover letter package
4. [Generate a tailored resume](#step-4-tailor-a-resume)
5. [Generate a cover letter](#step-5-write-a-cover-letter)
6. [Export to PDF](#step-6-export)

If you haven't installed the app yet, start with [install/docker.md](../install/docker.md).

---

## The color legend (read this once)

Reeesume uses a consistent color code across every AI surface:

| Color      | Meaning                                               |
| ---------- | ----------------------------------------------------- |
| **Blue**   | Your original MasterResume data — the source of truth |
| **Orange** | AI-suggested content — review before accepting        |
| **Green**  | Manually edited content — your final wording          |

This legend appears in the editor anytime AI is involved. If you forget what a color means, hover the entry — a tooltip reminds you.

---

## Step 1 — Configure an AI provider

AI features (vacancy analysis, resume tailoring, cover letters, ATS checks, rephrasing) all require an external AI service. Reeesume has no built-in model.

1. Click the **Settings** icon in the sidebar (gear icon, bottom-left).
2. Open the **AI Providers** tab.
3. Click **Add Provider**.
4. Pick a provider (e.g. OpenAI, Anthropic, Google, Ollama).
5. Paste your API key and pick a model.
6. Save.

For detailed instructions including where to get API keys, see [ai-providers.md](ai-providers.md). If you want zero data to leave your machine, use [Ollama](ollama-offline.md).

**Without a configured provider**, AI buttons are visible but disabled with a tooltip reading "Configure AI provider in Settings."

---

## Step 2 — Build your MasterResume

Your MasterResume is the structured, private database of your career. Tailored resumes pull from it. You have two options:

### Fast path — import an existing resume (recommended)

If you have a current resume as PDF or DOCX:

1. Go to **MasterResume** in the sidebar.
2. Click **Import Resume**.
3. Drag your file into the upload area (max 5 MB).
4. Pick your AI provider.
5. Click **Import**.
6. Watch the streaming progress — the AI extracts each section one at a time.
7. Review the summary (e.g. "3 work experiences, 2 education entries, 12 skills").
8. Click **Apply to MasterResume**. Choose **Merge** (recommended — appends to existing data) or **Overwrite** (clears everything first).

See [guides/import-existing-resume.md](../guides/import-existing-resume.md) for the full guide including what to check after import.

### Slow path — build from scratch

Click into each of the 11 sections and fill in your data manually:

- Contact Information
- Target Title
- Professional Summary
- Work Experience (Company → Role → Project)
- Education
- Skills & Interests
- Certifications
- Awards & Scholarships
- Projects
- Volunteering & Leadership
- Publications

See [guides/master-resume.md](../guides/master-resume.md) for section-by-section help.

---

## Step 3 — Create your first application

An **Application** is a self-contained package: one job vacancy + one tailored resume + one cover letter + tracking. Nothing is shared between applications.

1. Open **Applications** in the sidebar.
2. Click **New Application**.
3. Paste the job posting (text or URL) into the **Vacancy** field.
4. Optionally fill in: company, role, salary range, deadline, location, excitement rating.
5. Save.

You're now on the application detail page.

### Analyze the vacancy

1. Click **Analyze this posting**.
2. The AI streams back a structured breakdown:
   - Responsibilities
   - Must-haves
   - Nice-to-haves
   - ATS keywords
   - Company tone
   - Match preview against your MasterResume

This analysis helps you decide whether to apply and what to emphasize.

---

## Step 4 — Tailor a resume

1. Inside the application, click **Create Resume**.
2. The AI surfaces which MasterResume entries are most relevant — with reasoning for every include/exclude decision. **These show in orange.**
3. Accept or reject each suggestion.
4. Everything accepted becomes your first draft. **Blue** entries are pulled unchanged from your MasterResume.
5. Edit any bullet inline. **Edited entries turn green.**
6. The two-panel editor shows content on the left, live preview on the right.
7. When you're happy, click **Mark as Ready**. This flags the active draft; the tracker shows a "Resume ready" badge.

You can keep multiple drafts and switch which one is active.

### Run an ATS check

1. Click **Run ATS Check** (top of the resume editor).
2. The AI returns a score (0–100) with sub-scores and prioritized recommendations (HIGH / MED / LOW).
3. Apply the recommendations selectively — they're suggestions, not orders.

See [guides/applications.md](../guides/applications.md) for the full editor reference.

---

## Step 5 — Write a cover letter

1. Inside the application, click **Write Cover Letter**.
2. Pick a tone:
   - **Professional** — formal, balanced
   - **Confident & Direct** — punchy, results-focused
   - **Warm & Narrative** — story-driven, personable
3. The draft streams in paragraph by paragraph, each labelled with its source (e.g. "Drawn from your Work Experience at Acme").
4. Edit any paragraph inline. Use the **AI Rephrase** button on any paragraph to rewrite it.
5. Like resumes, you can keep multiple drafts and mark one active.

---

## Step 6 — Export

1. Open the resume (or cover letter) you want to export.
2. Click **Export**.
3. Pick **PDF** or **DOCX**.
4. Pick a template:
   - **ATS Simple** — single-column, maximum ATS compatibility (recommended default)
   - **Professional Classic** — two-column, subtle formatting
   - **Modern Minimal** — contemporary with an accent color
   - **International / German-style** — includes a photo slot, follows DE/AT/CH conventions
5. The file downloads.

PDF export uses an in-container Chromium via Puppeteer — what you see in the preview is what you get. See [guides/export.md](../guides/export.md) for details.

---

## You're done

You've installed Reeesume, configured AI, built your career database, created an application, tailored a resume, generated a cover letter, and exported to PDF.

**Where to go next:**

- [Application Tracker](../guides/tracker.md) — see your application pipeline at a glance
- [Where is my data?](../data-and-privacy/where-is-my-data.md) — understand exactly what's stored where
- [Backup and restore](../data-and-privacy/backup-restore.md) — set up a daily backup so you never lose your career database
