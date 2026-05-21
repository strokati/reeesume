# MasterResume

A private, local-first career management app. One master database of your entire career history — unlimited, never shared. Tailored resumes and cover letters per application, AI-assisted, exported as PDF or DOCX.

---

## Features

- **Master Resume** — structured career database with 11 sections (Work Experience, Education, Skills, Projects, Certifications, and more). The single source of truth, never sent anywhere.
- **Per-application packages** — each job application gets its own custom resume, cover letter, and status tracking. Changes in one application never affect another.
- **AI assistance** — analyze job postings, get tailored resume suggestions, run ATS checks, draft cover letters, rephrase bullets. Works with 10 AI providers (OpenAI, Anthropic, Google, Mistral, Groq, xAI, Cohere, z.ai, Ollama, custom). API keys are stored locally in the database — not in environment variables.
- **Application Tracker** — sortable table and Kanban view with status, salary, deadlines, follow-up dates, and excitement rating.
- **PDF & DOCX export** — WYSIWYG PDF via headless Chrome (Puppeteer); 4 built-in resume templates.
- **Resume import** — upload an existing PDF or DOCX and AI extracts it into your Master Resume.
- **Works fully offline** — AI features are the only thing that requires an internet connection (unless you use Ollama).

---

## Deployment Modes

| Mode             | `AUTH_MODE` | Auth                                          | Best for                               |
| ---------------- | ----------- | --------------------------------------------- | -------------------------------------- |
| **Local Docker** | `none`      | None — app opens directly at `localhost:3000` | Single machine, personal use           |
| **Self-hosted**  | `email_otp` | Passwordless 6-digit OTP sent to your email   | VPS / home server, multi-device access |

---

## Quick Start — Local Docker (recommended)

**Requirements:** Docker + Docker Compose

```bash
# 1. Clone the repo
git clone <repo-url>
cd master-resume

# 2. Copy env file (defaults work out of the box for local mode)
cp .env.example .env

# 3. Build and start
docker compose up --build
```

Open [http://localhost:3000](http://localhost:3000) — no login required.

Data is stored in a named Docker volume (`postgres_data`) and persists across restarts.

---

## Quick Start — Self-hosted (email OTP)

**Requirements:** Docker + Docker Compose, an SMTP server or email service

```bash
cp .env.example .env
```

Edit `.env`:

```env
AUTH_MODE=email_otp
ALLOWED_EMAIL=you@example.com
NEXTAUTH_SECRET=<run: openssl rand -base64 32>
NEXTAUTH_URL=https://your-domain.com

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=you@example.com
SMTP_PASS=your-password
SMTP_FROM=MasterResume <you@example.com>
```

```bash
docker compose up --build
```

On first visit you'll be prompted for your email. A 6-digit code is sent to `ALLOWED_EMAIL`. No passwords are ever set or stored.

---

## Development Setup

**Requirements:** Node.js 20+, Docker (for PostgreSQL)

```bash
# 1. Start the database (+ Mailhog for email catch at http://localhost:8025)
docker compose -f docker-compose.dev.yml up -d

# 2. Install dependencies
cp .env.example .env   # edit DATABASE_URL if needed
npm install

# 3. Set up the database
npx prisma migrate dev --name init

# 4. Start the dev server
npm run dev            # → http://localhost:3000
```

### Useful commands

```bash
npm run dev               # Next.js dev server with hot reload
npm run build             # Production build
npm run lint              # ESLint
npm run type-check        # TypeScript check (no emit)

npx prisma studio         # Database GUI → http://localhost:5555
npx prisma migrate dev    # Apply schema changes
npx prisma generate       # Regenerate Prisma client after schema edit
```

---

## Environment Variables

| Variable                | Required | Default                 | Description                                 |
| ----------------------- | -------- | ----------------------- | ------------------------------------------- |
| `DATABASE_URL`          | ✅       | —                       | PostgreSQL connection string                |
| `AUTH_MODE`             | ✅       | `none`                  | `none` (local) or `email_otp` (self-hosted) |
| `ALLOWED_EMAIL`         | OTP only | —                       | The only email address that may log in      |
| `NEXTAUTH_SECRET`       | OTP only | —                       | Random secret (`openssl rand -base64 32`)   |
| `NEXTAUTH_URL`          | OTP only | `http://localhost:3000` | Public app URL                              |
| `SMTP_HOST`             | OTP only | `localhost`             | SMTP server hostname                        |
| `SMTP_PORT`             | OTP only | `1025`                  | SMTP port                                   |
| `SMTP_USER`             | OTP only | —                       | SMTP username                               |
| `SMTP_PASS`             | OTP only | —                       | SMTP password                               |
| `SMTP_FROM`             | OTP only | —                       | From address for OTP emails                 |
| `SESSION_DURATION_DAYS` | —        | `30`                    | Auth session lifetime in days               |

AI provider API keys are configured in **Settings → AI Providers** inside the app and stored in the database. They are never read from environment variables.

See [`.env.example`](.env.example) for the full annotated list.

---

## Resume Templates

| ID                     | Name                         | Description                                                      |
| ---------------------- | ---------------------------- | ---------------------------------------------------------------- |
| `ats-simple`           | ATS Simple                   | Single-column, no tables or graphics. Maximum ATS compatibility. |
| `professional-classic` | Professional Classic         | Two-column, subtle formatting.                                   |
| `modern-minimal`       | Modern Minimal               | Contemporary design with accent color.                           |
| `international-de`     | International / German-style | Photo slot, follows DE/AT/CH resume conventions.                 |

---

## Tech Stack

Next.js 15 · React 19 · TypeScript · PostgreSQL 16 · Prisma · Tailwind CSS · shadcn/ui · Auth.js v5 · Vercel AI SDK · Tiptap · TanStack Query · Puppeteer · Docker

---

## Data & Privacy

- All data is stored in a PostgreSQL database running locally in Docker. Nothing is sent to any cloud service.
- AI calls go directly from the Next.js server to the provider you configure (OpenAI, Anthropic, etc.). There is no intermediary backend.
- For complete local operation with no data leaving your machine, use [Ollama](https://ollama.com/) as your AI provider.
- The Master Resume is never included in exports or sent to any third party — only the tailored Custom Resume for that specific application is exported.

---

## License

This project is licensed under the **GNU General Public License v3.0**.

You are free to use, study, and modify this software for personal use. If you distribute a modified version — including as a hosted service — you must release the full source code of your modified version under the same GPL v3 license.

See the [LICENSE](LICENSE) file for the full license text.
