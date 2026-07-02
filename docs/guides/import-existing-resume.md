# Import an Existing Resume

Turn a PDF or DOCX file into a structured MasterResume with AI extraction. This is the fastest way to bootstrap your career database — typically 30 seconds end-to-end.

---

## When to use this

- **First-time setup** — you already have a resume and don't want to type it all in.
- **Digitizing an old resume** — pull structured data out of a file you wrote years ago.
- **Switching from another tool** — migrate without losing content.

---

## Supported formats

- **PDF** — max 5 MB. **Must have a text layer** (selectable text). Scanned image-only PDFs won't work — the AI can't read pixels.
- **DOCX** — max 5 MB. Any Word document from Microsoft Word, Google Docs (exported), LibreOffice, etc.

To check whether a PDF has a text layer, open it and try selecting text. If you can highlight the words, it works.

---

## Step-by-step

1. Open the **MasterResume** page from the sidebar.
2. Click **Import Resume** (top-right of the page).
3. In the dialog that opens, drag your file into the **dropzone** — or click to browse.
4. Pick the **AI provider** to use for extraction.
5. Click **Import**.
6. Watch the streaming progress as the AI extracts each section:
   - "Extracting contact info…"
   - "Extracting work experience…"
   - "Extracting education…"
   - and so on for all 11 sections.
7. Review the **summary** — counts per section ("3 work experiences, 2 education entries, 12 skills").
8. Choose **Merge** or **Overwrite** (see below).
9. Click **Apply to MasterResume**.

The whole flow typically takes 15–45 seconds depending on file size and model speed.

---

## What the AI extracts

The AI attempts to fill every section of the MasterResume:

- Contact Information
- Target Title
- Professional Summary
- Work Experience (with the Company → Role → Project nesting reconstructed)
- Education
- Skills & Interests
- Certifications
- Awards & Scholarships
- Projects
- Volunteering & Leadership
- Publications

Empty sections are simply skipped — no empty entries are created.

The AI also does light **enrichment**:

- If technologies are implied but not stated, it may add them (verify carefully).
- If responsibilities are vague, it makes them action-verb led.
- If dates are inconsistent, it normalizes them.

---

## Merge vs Overwrite

When applying the import, you choose how it combines with existing data:

### Merge (recommended)

Appends the extracted entries to whatever is already in your MasterResume. Existing entries are preserved unchanged.

Use Merge for:

- First-time import (when the MasterResume is empty)
- Adding a partial resume later (e.g. importing an old project list when your main resume is already in)

### Overwrite

**Clears all existing data first**, then writes the extracted entries.

Use Overwrite only when:

- You're starting fresh
- You've backed up your existing MasterResume (export it first)
- You're certain the new file is the source of truth

Overwrite cannot be undone. Use Merge if there's any doubt.

---

## Reviewing the import

AI extraction is good but not perfect. **Always spot-check after import:**

- **Tech keywords** — the AI sometimes hallucinates tools you don't actually know. Common false positives: trendy frameworks confused with similar-sounding ones.
- **Dates** — start/end dates for roles and education often get scrambled, especially when formatted unusually.
- **Job titles** — sometimes translated or "improved."
- **Quantitative claims** — "Led team of 5" might have been "team of 3" in the source.
- **Spelling of company and school names** — verify proper nouns.

A 5-minute review pass catches ~95% of issues.

---

## Troubleshooting

- **"File too large" error** — your file is over 5 MB. Compress it (smaller images, fewer pages) or split it.
- **"Unsupported format"** — you uploaded something that isn't PDF or DOCX. Convert it first.
- **"Could not extract text"** — your PDF has no text layer (scanned images). Run it through an OCR tool first, or retype manually.
- **AI provider returned an error** — check the provider is configured correctly in Settings. See [getting-started/ai-providers.md](../getting-started/ai-providers.md).
- **Extraction missed major sections** — try a different model or paste the resume text into a clean Word document and retry.

See also: [troubleshooting/common-issues.md](../troubleshooting/common-issues.md).
