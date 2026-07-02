# Application Tracker

The Tracker is a dashboard across all your applications. Two views: **Table** (spreadsheet-style) and **Kanban** (drag-to-update by status).

Open it from the sidebar → **Tracker**.

---

## Table view

The default view. Each row is one application.

### Columns

| Column                   | What it shows                                                                                             |
| ------------------------ | --------------------------------------------------------------------------------------------------------- |
| **Job Position**         | Role title                                                                                                |
| **Company**              | Company name                                                                                              |
| **Min Salary**           | Lower end of the posted range                                                                             |
| **Max Salary**           | Upper end of the posted range                                                                             |
| **Proposed Salary**      | The actual number you're negotiating (added when you have a concrete offer or counter)                    |
| **Location**             | City, region, or "Remote"                                                                                 |
| **Status**               | Current pipeline stage (saved → applied → … → offer / rejected)                                           |
| **Date Saved**           | When you created the application                                                                          |
| **Pipeline event dates** | Concrete dates: phone screen, onsite, offer deadline, etc. (replaces the old Deadline + Follow-up fields) |
| **Date Applied**         | When you submitted the application                                                                        |
| **Excitement**           | 1–5 stars — your gut feeling about the role                                                               |

### Multi-currency salaries

Salary fields include a **currency code** (USD, EUR, GBP, etc.). Set the currency per application when you create or edit it. The tracker shows the currency next to each salary value — useful when applying across regions.

You can't sum salaries across currencies in the tracker (the app doesn't do FX conversion). Treat each row's salary as standalone.

---

## Kanban view

Switch to Kanban via the toggle at the top-right of the tracker.

Columns are by status:

```
| Saved | Planned | Applied | Screening | Interview | Offer | Rejected | On Hold |
```

- **Drag a card** between columns to change its status.
- **Click a card** to open the row detail panel.

Cards show: position, company, salary range, excitement rating, and key upcoming date (if any).

---

## Row detail panel

Clicking any row (in either view) opens a **detail panel** with three tabs:

### Tab 1 — Overview

Application summary: status, salary, location, dates, excitement. Quick links to the application's resume and cover letter drafts.

### Tab 2 — Timeline / Notes

A timestamped log of everything that's happened with this application:

- Status changes
- Resume / cover letter drafts created and marked ready
- Manual notes you've added (interview feedback, recruiter conversations, etc.)

Add a new note any time. Notes are timestamped and visible only to you.

### Tab 3 — Application links

Quick links into the full application detail page, resume editor, cover letter editor, and export.

---

## Sorting and filtering

### Sorting

Click any column header in the table view to sort by it. Click again to reverse. Common sorts:

- **Excitement descending** — your favorite roles first
- **Deadline ascending** — what's due soonest
- **Date Saved descending** — most recent first (default)

### Filtering

Filters appear at the top of the table:

- **Status** — show only specific statuses (e.g. only `interview` and `offer`)
- **Excitement** — show only 4+ star roles
- **Date range** — saved within the last week, month, etc.

Combine filters for precision (e.g. "all interviews saved in the last 30 days with 4+ stars").

---

## Pipeline event dates

Instead of a single generic "Deadline" and "Follow-up" date, Reeesume tracks **concrete pipeline events** with their own dates. Examples:

- Phone screen — scheduled for 2026-07-15
- Take-home assignment — due 2026-07-22
- Onsite — scheduled for 2026-08-01
- Offer deadline — 2026-08-10

Add and edit events from the application detail page. They show up in the tracker and in the row detail timeline.

This makes the tracker actually useful for managing your pipeline week-to-week, not just recording statuses.

---

## Excitement rating

The 1–5 star rating is **your subjective enthusiasm** for the role — not a quality score for the company.

Common uses:

- **5 stars** — dream role, drop everything to apply well
- **3 stars** — fine, apply with moderate effort
- **1 star** — applying as a backup, don't over-invest

Use excitement to prioritize your week. Sort descending, work top-down.

---

## Workflow tips

- **Use the tracker as your weekly planning view.** Filter to `applied` + `screening` + `interview` every Monday to see what needs follow-up.
- **Add a note after every interview** while it's fresh. Future-you will thank past-you.
- **Set a pipeline event for next steps immediately** after a call — don't trust your memory.
- **Don't be afraid to mark `rejected`** — closed applications disappear from the active pipeline but stay searchable.
- **Use `on_hold`** for roles where the company went quiet — easier than deleting and recreating later.
