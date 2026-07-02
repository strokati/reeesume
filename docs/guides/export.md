# Export Guide

Reeesume exports your tailored resume or cover letter as **PDF** or **DOCX**. PDF is the default for most uses; DOCX is for recruiters who explicitly require Word format.

---

## Two formats

| Format   | When to use                                                     | How it's made                                                               |
| -------- | --------------------------------------------------------------- | --------------------------------------------------------------------------- |
| **PDF**  | Default. WYSIWYG — what you see in the preview is what you get. | Puppeteer renders the resume HTML in a headless Chromium and prints to PDF. |
| **DOCX** | When a recruiter or ATS specifically asks for Word.             | The `docx` npm package generates a Word document programmatically.          |

PDF is more reliable for visual fidelity. Use DOCX only when explicitly required.

---

## How to export

1. Open the resume draft (or cover letter draft) you want to export.
2. Click **Export** (top-right of the editor).
3. Pick **PDF** or **DOCX**.
4. Pick a template.
5. The file downloads to your browser's default download folder.

Filenames follow the pattern `Lastname-Firstname-Resume-<template>.pdf`.

---

## Templates

Five built-in templates:

| ID                     | Name                             | Best for                                                                                  |
| ---------------------- | -------------------------------- | ----------------------------------------------------------------------------------------- |
| `ats-simple`           | **ATS Simple**                   | Single-column, no tables or graphics. Maximum ATS compatibility. **Recommended default.** |
| `professional-classic` | **Professional Classic**         | Two-column with subtle formatting. Traditional corporate look.                            |
| `modern-minimal`       | **Modern Minimal**               | Single-column, contemporary with an accent color. Tech / startup vibe.                    |
| `international-de`     | **International / German-style** | Includes a photo slot, follows DE / AT / CH conventions. For German-speaking markets.     |
| `blue-professional`    | **Blue Professional**            | Clean single-column with blue accents, project sub-entries, and inline stack lines.       |

### Picking a template

- **Online applications through big-company ATS** → `ats-simple` always. Complex layouts confuse ATS parsers.
- **Direct email to a recruiter or hiring manager** → any template. Pick what fits the company's vibe.
- **German / Austrian / Swiss applications** → `international-de`. Local conventions matter there.
- **Tech / startup** → `modern-minimal` or `blue-professional`.
- **Conservative industries** (finance, law, government) → `professional-classic`.

### Switching templates

Templates are presentation-only — switching doesn't change your content. You can export the same draft in multiple templates to see which looks best.

---

## Photo slot

The `international-de` template (and any template marked as supporting photos) includes a headshot slot. To add a photo:

1. Open **Settings** → **Profile** (or the per-resume photo upload, depending on the template).
2. Upload a headshot.
3. Recommended: square aspect ratio, professional headshot, under 500 KB.

Photos are embedded in the exported PDF/DOCX. They're never uploaded anywhere — the export is fully local.

---

## ATS-friendly tips

For online applications through ATS systems:

- **Use `ats-simple`** — single-column, no tables, no graphics.
- **Avoid columns and sidebars** — ATS parsers read top-to-bottom, left-to-right. Multi-column layouts get jumbled.
- **Don't put critical info in headers/footers** — some ATS ignore them.
- **Use standard section headings** ("Work Experience", "Education") — creative names like "Where I've Been" don't get parsed.
- **Keep file size under 1 MB** — some ATS reject large files. PDFs from Reeesume are typically 100–300 KB.
- **Submit PDF unless the ATS requires DOCX** — PDF preserves formatting. Use DOCX only when explicitly told to.

---

## DOCX gotchas

DOCX rendering differs slightly from PDF because the `docx` library generates Word's native format rather than rendering HTML:

- Bullet alignment can vary.
- Font fallbacks may differ if the recipient doesn't have your fonts installed.
- Templates with complex layouts (multi-column, accent colors) may look different in Word.

If a recruiter requires Word, still send a PDF as well if possible. Most recruiters will accept either.

---

## What the export contains

The exported file contains **only the entries in your active draft**, not your full MasterResume. Specifically:

- The bullets, paragraphs, and dates you included in this application's resume draft.
- The contact info, target title, and professional summary as edited for this application.
- Nothing from other applications.
- Nothing that you didn't explicitly include.

The MasterResume itself is never exported — only curated views of it.
