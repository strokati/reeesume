# Privacy

Reeesume is built privacy-first. This page explains exactly what stays on your machine, what leaves, and to whom.

---

## TL;DR

- The app has **no cloud backend**. There is no Reeesume server.
- Your career data stays in your local PostgreSQL database.
- The only thing that leaves your machine is what you send to your **configured AI provider** (if any).
- Use [Ollama](../getting-started/ollama-offline.md) for fully-offline AI — **zero data leaves your machine**.

---

## What stays on your machine

- All MasterResume contents (every section, every entry)
- All application data (vacancies, tailored resumes, cover letters, notes)
- All tracking data (statuses, salaries, pipeline events, excitement ratings)
- AI provider API keys (encrypted in the database)
- AI Call Log (your local audit trail)
- Auth sessions and OTP codes (self-hosted mode)

None of this is uploaded by the app. See [where-is-my-data.md](where-is-my-data.md) for the full inventory.

---

## What leaves your machine

The app makes network requests in only three situations:

### 1. Cloud AI provider calls

When you run an AI operation (vacancy analysis, resume tailoring, cover letter generation, rephrase, ATS check, resume import) using a **cloud provider**, the relevant text is sent from your machine directly to that provider's API.

| Provider            | What you send                               | Where it goes                       |
| ------------------- | ------------------------------------------- | ----------------------------------- |
| **OpenAI**          | Prompt text (vacancy, resume bullets, etc.) | `api.openai.com`                    |
| **Anthropic**       | Prompt text                                 | `api.anthropic.com`                 |
| **Google Gemini**   | Prompt text                                 | `generativelanguage.googleapis.com` |
| **Mistral**         | Prompt text                                 | `api.mistral.ai`                    |
| **Groq**            | Prompt text                                 | `api.groq.com`                      |
| **xAI**             | Prompt text                                 | `api.x.ai`                          |
| **z.ai**            | Prompt text                                 | `api.z.ai`                          |
| **DeepSeek**        | Prompt text                                 | `api.deepseek.com`                  |
| **Custom endpoint** | Prompt text                                 | Whatever URL you configured         |

**Reeesume does not log, intermediate, or store your prompts in transit.** The app calls the provider's API directly using the Vercel AI SDK; the response streams straight back.

What each provider does with your prompt after they receive it is governed by their own data policies, which change over time. Read them:

- [OpenAI Data Controls](https://platform.openai.com/docs/guides/your-data)
- [Anthropic Privacy Policy](https://www.anthropic.com/legal/privacy)
- [Google Gemini API Data Management](https://ai.google.dev/gemini-api/data)
- [Mistral AI Privacy](https://mistral.ai/privacy-policy/)
- [Groq Privacy](https://groq.com/privacy-policy/)
- [xAI Privacy](https://x.ai/legal/privacy-policy)
- [DeepSeek Privacy](https://www.deepseek.com/privacy)

### 2. SMTP email (self-hosted mode only)

When you log in via OTP, the 6-digit code is sent via your configured SMTP server to your email address. The code expires in 10 minutes and is stored hashed — the database never holds the plaintext code.

In local mode (`AUTH_MODE=none`), no SMTP is configured and no email is ever sent.

### 3. Docker image pulls (install and updates only)

The first `docker compose up --build` pulls images from Docker Hub (Postgres, Node, etc.). After install, no further Docker Hub traffic is needed unless you update.

---

## What each provider does with what you send

Cloud AI providers typically use your prompts for two things:

1. **Generating the response** (the immediate reason you called them).
2. **Possibly training future models** — policies vary. OpenAI's API (not ChatGPT) defaults to **not** training on API data; Anthropic API data is not used for training; Google's Gemini API has a free tier that may use data for training and a paid tier that doesn't.

**If this matters to you, read the provider's current policy.** Reeesume has no control over what the provider does once it receives your data — the only way to fully prevent data from leaving your machine is to use Ollama.

---

## PDF / DOCX export

PDF export uses **Puppeteer** (headless Chromium running inside the app container) — your resume is rendered locally and the file is generated on your machine. Nothing about the export is uploaded.

DOCX export uses the `docx` npm library — also fully local, no network calls.

---

## AI Call Log

The app keeps a record of every AI call you make, in the `AiCallLog` database table:

- Timestamp
- Provider (e.g. `openai`, `anthropic`)
- Model (e.g. `gpt-4o`)
- Operation (e.g. `analyze-vacancy`, `cover-letter`)

This log is **for your own transparency** — visible in Settings → AI Providers → Logs. It is **not** reported anywhere; it lives only in your local database.

The log records **metadata**, not prompt contents. Your actual prompts (vacancy text, resume bullets) are not retained in the database.

---

## Telemetry

The app collects **no telemetry**. Specifically:

- Next.js telemetry is disabled (`NEXT_TELEMETRY_DISABLED=1` in the Dockerfile).
- No analytics SDK is in `package.json` (no Posthog, no Sentry, no Segment, no Google Analytics).
- No usage data is sent to Reeesume's author or any third party.

Verify yourself:

```bash
# Search package.json for analytics/telemetry packages — should return nothing
grep -iE "analytics|telemetry|posthog|sentry|segment" package.json

# Confirm Next.js telemetry is disabled in the image
grep "NEXT_TELEMETRY_DISABLED" Dockerfile
```

---

## Encryption of stored API keys

API keys you enter in Settings are encrypted in the database using **AES-256-GCM**. The encryption key is derived from `NEXTAUTH_SECRET` via `scryptSync`.

- **Self-hosted mode:** the key is derived from your `NEXTAUTH_SECRET`. Anyone with both database access AND your `.env` file can decrypt your keys.
- **Local mode (`AUTH_MODE=none`):** if `NEXTAUTH_SECRET` is not set, the app falls back to a hardcoded static key. This means anyone with database access can decrypt your keys. For a single-user personal machine this is acceptable; for any shared scenario, use self-hosted mode.

The full encryption logic is in `src/lib/ai/encryption.ts` — open source, auditable.

---

## If you want zero data to leave your machine

Use [Ollama](../getting-started/ollama-offline.md) as your AI provider. The model runs locally; no prompts leave your machine; no API key is required. Trade-off: model quality is below frontier cloud models.

---

## Deleting your data

See [backup-restore.md → Deleting your data](backup-restore.md#deleting-your-data).

- `docker compose down -v` — removes the Docker volume entirely.
- `npx prisma migrate reset` — wipes tables, keeps the volume.

Both are irreversible. Export a backup first if there's any chance you'll want the data later.
