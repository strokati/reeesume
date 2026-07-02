# Reeesume Documentation

Install and use Reeesume on your own machine. Your career data stays private.

Reeesume is a privacy-first, local-first career management tool. It uses AI to tailor your resume to every job vacancy — but it has no cloud backend, and your data never leaves your machine unless you explicitly connect a cloud AI provider.

---

## Choose your path

Three ways to run Reeesume. Pick one:

| Path                                 | Best for                               | Auth                      | Guide                                                          |
| ------------------------------------ | -------------------------------------- | ------------------------- | -------------------------------------------------------------- |
| **Docker, local mode** (recommended) | Single machine, personal use           | None — app opens directly | [install/docker.md](install/docker.md)                         |
| **Docker, self-hosted**              | Multi-device access, VPS / home server | Passwordless email OTP    | [install/docker-self-hosted.md](install/docker-self-hosted.md) |
| **From source (Node.js)**            | Users who don't want Docker            | Configurable              | [install/native.md](install/native.md)                         |

Before you start, check the [system requirements](install/system-requirements.md).

---

## New here?

The [5-minute first-run walkthrough](getting-started/first-run.md) takes you from "app installed" to "first tailored resume exported." It covers:

1. Configuring an AI provider
2. Building (or importing) your MasterResume
3. Creating your first application
4. Generating a tailored resume and cover letter
5. Exporting to PDF

---

## Guides

Reference docs for each part of the app.

| Guide                                                         | What it covers                                                |
| ------------------------------------------------------------- | ------------------------------------------------------------- |
| [MasterResume](guides/master-resume.md)                       | Building your permanent career database — all 11 sections     |
| [Import an existing resume](guides/import-existing-resume.md) | Turn a PDF or DOCX into structured data with AI               |
| [Applications](guides/applications.md)                        | Vacancy analysis, tailored resumes, cover letters, ATS checks |
| [Application Tracker](guides/tracker.md)                      | Table and Kanban views, statuses, salary, deadlines           |
| [Export](guides/export.md)                                    | PDF and DOCX export, four built-in templates                  |

---

## AI providers

Reeesume supports 10 AI providers. API keys are stored in your local database — never in environment variables.

- [Configure cloud providers](getting-started/ai-providers.md) — OpenAI, Anthropic, Google Gemini, Mistral, Groq, xAI, Cohere, z.ai
- [Set up Ollama for fully-offline AI](getting-started/ollama-offline.md) — **zero data leaves your machine**

> **Want maximum privacy?** Use Ollama. The AI model runs on your own computer; no API key, no network calls.

---

## Data and privacy

| Guide                                                     | What it answers                                            |
| --------------------------------------------------------- | ---------------------------------------------------------- |
| [Where is my data?](data-and-privacy/where-is-my-data.md) | Exact file paths, Docker volume names, what's stored where |
| [Backup and restore](data-and-privacy/backup-restore.md)  | Copy-pasteable `pg_dump` commands and restore procedures   |
| [Privacy](data-and-privacy/privacy.md)                    | What leaves your machine — and what doesn't                |

---

## Updating

How to pull new versions and apply database migrations:

- [Updating Reeesume](install/updating.md)

---

## Troubleshooting

- [Common issues](troubleshooting/common-issues.md) — port conflicts, build failures, Puppeteer, DB, AI errors, OTP
- [FAQ](troubleshooting/faq.md) — short answers to recurring questions
