# Where Is My Data?

A precise inventory of where everything lives.

> **Short answer:** All your data lives in a PostgreSQL database running on your own machine (or your own server). Nothing is sent to any cloud service unless you explicitly configure a cloud AI provider.

---

## Docker installs

| What                                        | Where                                                                                                          |
| ------------------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| **Database files**                          | The `postgres_data` Docker named volume, defined in `docker-compose.yml`.                                      |
| **App container**                           | Stateless. Configuration, sessions, OTP codes — all stored in the database, not on the container's filesystem. |
| **Uploaded files (resume imports, photos)** | Processed in memory. Never written to disk.                                                                    |
| **Logs**                                    | Container stdout. View with `docker compose logs -f app`. Not written to disk by default.                      |

### Inspecting the volume

```bash
# List Docker volumes — you'll see reeesume_postgres_data (or similar)
docker volume ls | grep postgres_data

# Inspect the volume's location on disk
docker volume inspect reeesume_postgres_data
```

The `Mountpoint` field in the output is the actual path on your host's filesystem. You shouldn't normally need to touch this — back up via `pg_dump` instead (see [backup-restore.md](backup-restore.md)).

---

## Native installs (Node.js from source)

| What                                                 | Where                                                                                                                                                                     |
| ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Database files**                                   | Wherever your PostgreSQL data directory is. Defaults: `/var/lib/postgresql/data` (Linux), `/usr/local/var/postgres` (Homebrew macOS), or your managed provider's storage. |
| **App runtime**                                      | The Next.js process. Doesn't write to disk except for the `.next/` build cache and `node_modules/`.                                                                       |
| **Uploaded files**                                   | Processed in memory. Never written to disk.                                                                                                                               |
| **Dev database (if using `docker-compose.dev.yml`)** | The `postgres_data_dev` Docker named volume.                                                                                                                              |

If you used `docker-compose.dev.yml` for the database only, the same Docker-volume rules apply as in the Docker install section above.

---

## What's in the database

The PostgreSQL database holds every piece of data Reeesume knows about. Major tables (verify against `prisma/schema.prisma`):

| Table                           | What it holds                                                                                               |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `User`                          | Your user profile                                                                                           |
| `MasterResume` + 8 child tables | Your career database: work, education, skills, certifications, awards, projects, volunteering, publications |
| `Vacancy`                       | Job postings you've saved                                                                                   |
| `Application`                   | Job applications (status, salary, dates, excitement)                                                        |
| `ResumeDraft`                   | Tailored resume drafts per application (versioned)                                                          |
| `CoverLetterDraft`              | Cover letter drafts per application (versioned)                                                             |
| `ApplicationNote`               | Timestamped notes on each application                                                                       |
| `AiProviderConfig`              | Your AI provider settings and encrypted API keys                                                            |
| `AiCallLog`                     | Audit trail of every AI call (timestamp, provider, model, operation)                                        |
| `AiPromptOverride`              | Custom prompt overrides if you've set any                                                                   |
| `OtpCode`                       | Hashed OTP codes for login (self-hosted mode only)                                                          |
| `Session`                       | Auth.js sessions (self-hosted mode only)                                                                    |

---

## AI provider API keys

API keys are stored **encrypted** in the `AiProviderConfig` table using AES-256-GCM. The encryption key is derived (via `scryptSync`) from:

- **Self-hosted mode (`AUTH_MODE=email_otp`):** Your `NEXTAUTH_SECRET` from `.env`. **Critical implication:** if you lose `NEXTAUTH_SECRET`, your stored API keys become unreadable — you'll need to re-enter them.
- **Local mode (`AUTH_MODE=none`):** A static fallback key (hardcoded in `src/lib/ai/encryption.ts`). This is a deliberate trade-off so local mode works without `.env` configuration. **Implication:** anyone with filesystem access to your Postgres database can decrypt your API keys. For a single-user personal machine, this is acceptable. For any multi-user scenario, switch to self-hosted mode.

The full encryption logic is in `src/lib/ai/encryption.ts` — feel free to audit it.

---

## Logs

The app logs to **stdout** — visible in the terminal where you started it.

- **Docker:** `docker compose logs -f app` to tail logs.
- **Native:** logs appear in the terminal where `npm run dev` (or `npm run start`) is running.

What gets logged: standard Next.js request logs, Prisma query errors, AI operation start/finish, OTP send attempts (self-hosted). The app does **not** log prompt contents, resume text, or API keys to stdout.

For AI call auditing (which provider, model, and operation was called), check the in-app **AI Call Log** in Settings → AI Providers → Logs. That lives in the database, not in stdout.

---

## What's NOT stored anywhere

A few things you might expect to find but won't:

- **Reeesume exports** — generated on demand, never cached on disk.
- **AI prompt contents** — sent to the provider, response streamed back, not stored (the AiCallLog records metadata, not contents).
- **OTP codes after use** — deleted once verified or expired.
- **Uploaded resume files** — parsed in memory, then discarded. The extracted data lands in your MasterResume; the file itself is gone.
- **Photos uploaded for templates** — embedded directly into the exported PDF/DOCX, not stored as separate files on disk.
