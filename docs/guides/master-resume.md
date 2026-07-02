# MasterResume Guide

Your **MasterResume** is the structured, unlimited, private database of your entire career history. It's never sent anywhere. Every tailored resume pulls from it.

Think of it as the source of truth — you maintain it once, and every job application becomes a curated view of it.

---

## What goes in it

The Reeesume has 11 sections:

| Section                       | What it holds                         | Example entries                         |
| ----------------------------- | ------------------------------------- | --------------------------------------- |
| **Contact Information**       | Name, email, phone, location, links   | "email@example.com", LinkedIn URL       |
| **Target Title**              | The role you're aiming for            | "Senior Frontend Engineer"              |
| **Professional Summary**      | 2–4 sentences positioning you         | A paragraph you tweak per market        |
| **Work Experience**           | Companies → Roles → Projects (nested) | Acme Corp → Senior Eng → Mobile Rewrite |
| **Education**                 | Degrees, certifications from schools  | B.Sc. Computer Science, MIT, 2018       |
| **Skills & Interests**        | Technical and personal skills         | React, TypeScript; hiking, chess        |
| **Certifications**            | Professional certifications           | AWS Solutions Architect Associate       |
| **Awards & Scholarships**     | Honors received                       | "Dean's List 2017"                      |
| **Projects**                  | Side projects, open source            | "Maintainer of X library (1.2k stars)"  |
| **Volunteering & Leadership** | Volunteer roles, board seats          | "Mentor at local code school"           |
| **Publications**              | Papers, articles, books               | "Co-author, IEEE ICSE 2022"             |

You don't need to fill every section. Empty sections are simply hidden from tailored resumes.

---

## Adding entries

Most sections follow the same pattern:

1. Open the section card on the MasterResume page.
2. Click **Add** (or **+ New Entry**).
3. Fill in the form fields.
4. Click **Save**.

The entry appears immediately. Most entries can be edited inline by clicking the field, and deleted via the trash icon (with a confirmation prompt).

---

## Work Experience — the special case

Work Experience is **nested three levels deep**:

```
Company (e.g. Acme Corp)
└── Role (e.g. Senior Frontend Engineer)
    └── Project (e.g. Mobile App Rewrite, optional)
```

This nesting lets you:

- Hold multiple roles at the same company (promotions).
- Break a long role into named projects for clarity.
- Pull specific projects into a tailored resume without dragging in the whole role.

**To add a role to an existing company:** click the company card → **Add Role**.

**To add a project to a role:** click the role → **Add Project**.

**To reorder:** grab the drag handle (⋮⋮ on the left of any entry) and drag.

---

## Editing and reordering

- **Inline edit:** click any text field to edit it. Tab to the next field. Press Enter or click away to save.
- **Drag to reorder:** within any section, entries have a drag handle. Drag changes the order — which is preserved when entries are pulled into tailored resumes.
- **Delete:** click the trash icon. The app asks for confirmation. Deletions are permanent (no undo), but the MasterResume is your data — feel free to keep things tidy.

---

## AI Rephrase

Any bullet point or paragraph in your MasterResume can be rephrased by AI:

1. Hover the bullet or paragraph.
2. Click the **AI Rephrase** icon (sparkles).
3. The AI returns a single rewritten version.
4. Accept or reject.

Common reasons to rephrase: stronger action verbs, more concise wording, different emphasis.

This changes the MasterResume directly — use it when you want the improvement everywhere, not just in one tailored resume.

---

## Multi-language resumes

Different job markets need different resumes — not just translations, but different framing. A German CV has different conventions than an English one; a Spanish one different again.

Reeesume lets you maintain **separate MasterResume databases per language**. Each is its own complete career database with its own tailored applications. Switch between them from the MasterResume page (the cards overview added in v1.4).

This is also useful for **multi-track job searches** — e.g. one MasterResume emphasizing engineering leadership, another emphasizing hands-on IC work.

---

## Privacy reminder

Nothing in your MasterResume ever leaves your machine unless you explicitly:

- Export a tailored resume (which contains only the entries you selected, tailored).
- Run an AI operation that uses your content (e.g. rephrasing a bullet sends that bullet to your configured AI provider — and only if you're using a cloud provider; Ollama keeps everything local).

The MasterResume itself is never uploaded. See [data-and-privacy/privacy.md](../data-and-privacy/privacy.md) for the full picture.

---

## Next steps

- [Import an existing resume](import-existing-resume.md) — bootstrap from a PDF or DOCX
- [Create an application](applications.md) — turn master data into a tailored resume
