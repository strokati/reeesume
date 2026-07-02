# Applications Guide

An **Application** is a self-contained package:

```
Application
├── Vacancy (the job posting)
├── Tailored Resume (one or more drafts)
├── Cover Letter (one or more drafts, optional)
├── Tracking fields (status, salary, deadlines)
└── Notes (timestamped)
```

**Nothing is shared between applications.** Editing one application's resume never touches the MasterResume or any other application.

---

## Creating an application

1. Open **Applications** from the sidebar.
2. Click **New Application**.
3. Fill in the form:
   - **Job posting** (required) — paste the text or a URL.
   - **Company**, **Role**, **Location** — optional but recommended.
   - **Salary range** (min/max, with currency) — optional.
   - **Deadline** — optional.
   - **Excitement rating** (1–5 stars) — optional, helps prioritize.
4. Save.

You land on the application detail page.

---

## Analyzing the vacancy

Click **Analyze this posting**. The AI streams back a structured breakdown:

- **Responsibilities** — what the role actually does day-to-day
- **Must-haves** — non-negotiable requirements
- **Nice-to-haves** — bonus skills
- **ATS keywords** — terms to include in your resume for ATS filtering
- **Tone** — formal, casual, startup-y, enterprise-y — informs your cover letter voice
- **Match preview** — how your MasterResume lines up against the must-haves

### Persisting the analysis

The analysis is saved automatically to the application. Run it again any time with **Re-Analyze** — useful if your Reeesume has changed significantly since the last analysis.

---

## Tailoring the resume

Click **Create Resume** inside the application. The AI surfaces which of your MasterResume entries are most relevant — every entry shows reasoning for the include/exclude recommendation.

**The color legend (same as elsewhere):**

| Color  | Meaning                                        |
| ------ | ---------------------------------------------- |
| Blue   | Original MasterResume data — pulled unchanged  |
| Orange | AI-suggested content — review before accepting |
| Green  | Manually edited content — your final wording   |

### Accepting suggestions

For each suggested entry, click **Accept** to include it in your draft or **Reject** to leave it out. Accepted entries become your starting draft.

### Editing the draft

- Edit any text inline. Edited entries turn green.
- Reorder entries by drag-and-drop.
- Add new entries that don't exist in your MasterResume (these stay in this draft only — they don't pollute the master).
- Use **AI Rephrase** on any bullet for stronger wording.

### The two-panel editor

The editor splits your screen:

- **Left:** content — entries, bullets, drag handles
- **Right:** live preview — what the exported PDF will look like with the current template

The right panel updates as you type.

### Mark as Ready

When you're happy with a draft, click **Mark as Ready**. This:

- Flags the draft as the active version
- Shows a "Resume ready" badge in the tracker
- Doesn't lock the draft — you can still edit it

You can keep multiple drafts and switch which is active. Only one draft per application can be "ready" at a time.

---

## Writing the cover letter

Click **Write Cover Letter** inside the application.

### Pick a tone

- **Professional** — formal, balanced. Default for most corporate roles.
- **Confident & Direct** — punchy, results-focused. Good for senior / startup roles.
- **Warm & Narrative** — story-driven, personable. Good for culture-fit-forward companies.

### The draft

The AI streams the cover letter paragraph by paragraph. Each paragraph is labelled with its **source**:

- "Drawn from your Work Experience at Acme"
- "Reflects the must-have: leadership"
- "Addresses the company's stated mission"

These labels are visible in the editor but **not** in the exported file.

### Editing and rephrasing

- Edit any paragraph inline.
- Use **AI Rephrase** on any paragraph for a different angle.
- Like resumes, you can keep multiple drafts and mark one active.

---

## ATS check

Click **Run ATS Check** from the resume editor. The AI returns:

- **Overall score** (0–100)
- **Sub-scores** by category (keyword coverage, formatting, impact, length)
- **Prioritized recommendations** tagged HIGH / MED / LOW
- **Keyword gaps** — must-have keywords from the vacancy that don't appear in your resume

### Applying recommendations

Each recommendation has an **Apply** button where applicable (e.g. "Add the keyword 'Kubernetes'"). Apply selectively — the AI's priorities may not match yours.

ATS scores are directional, not absolute. A score of 75+ is generally good. Don't chase 100 — some "recommendations" will weaken the resume for a human reader.

---

## Applying AI suggestions to drafts

Recent versions of Reeesume let you **apply AI suggestions directly to the current draft** with one click, instead of accepting them one at a time. Look for the **Apply Suggestions** button in the resume editor — it batches all accepted suggestions into a single draft update.

This is especially useful after running **resume-suggestions** for the first time on a fresh application.

---

## Editing boundaries — what changes where

This is the most important rule in Reeesume:

| Action                          | Affects                                             |
| ------------------------------- | --------------------------------------------------- |
| Edit a tailored resume draft    | Only that application's draft                       |
| Edit a cover letter draft       | Only that application's draft                       |
| Edit the MasterResume           | All future applications (existing drafts unchanged) |
| AI Rephrase on a draft          | Only that draft                                     |
| AI Rephrase on the MasterResume | The MasterResume itself                             |

You can experiment freely inside an application. Nothing leaks back.

---

## Statuses

Every application has a status. The values:

| Status      | Meaning                                       |
| ----------- | --------------------------------------------- |
| `saved`     | You saved the vacancy but haven't decided yet |
| `planned`   | You intend to apply                           |
| `applied`   | Application submitted                         |
| `screening` | Recruiter / HR screen in progress             |
| `interview` | Interviewing                                  |
| `offer`     | You have an offer                             |
| `rejected`  | Closed — didn't get an offer, or you declined |
| `on_hold`   | Paused — waiting on something, deprioritized  |

Status drives the [tracker](tracker.md) Kanban view.

---

## Next steps

- [Tracker guide](tracker.md) — see all your applications in one dashboard
- [Export guide](export.md) — produce the final PDF / DOCX file
