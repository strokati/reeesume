# FAQ

Short answers to recurring questions. Each is 2–4 lines.

---

### Is my data really private?

Yes. All data lives in your local PostgreSQL database. The only thing that leaves your machine is what you send to your configured AI provider (if any). Use Ollama for fully-offline operation. See [privacy.md](../data-and-privacy/privacy.md).

### Can I sync across devices?

Use [self-hosted mode](../install/docker-self-hosted.md) — `AUTH_MODE=email_otp`. Install on a server or home machine, log in from any device with the OTP code. Local mode (`AUTH_MODE=none`) is single-machine only.

### Can I run this without Docker?

Yes. See [install/native.md](../install/native.md). You'll need Node.js 20+ and PostgreSQL (Docker sidecar, native Postgres, or managed).

### Can I use this fully offline?

Yes — install [Ollama for AI](../getting-started/ollama-offline.md). Once configured, no network calls are needed for any AI operation. The app's own database is always local.

### How do I back up my data?

Daily `pg_dump` via Docker. See [backup-restore.md](../data-and-privacy/backup-restore.md) for the exact commands. Back up your `.env` separately — `NEXTAUTH_SECRET` is required to decrypt stored AI keys.

### Can I have multiple MasterResumes (one per language)?

Yes. Reeesume supports multiple MasterResume databases, each with its own tailored applications. Useful for different languages or different job-search tracks. See [guides/master-resume.md → Multi-language resumes](../guides/master-resume.md#multi-language-resumes).

### Will my existing resume import correctly?

Mostly. PDF and DOCX with selectable text work well. Scanned image-only PDFs don't. Always spot-check imported data — the AI sometimes hallucinates tech keywords. See [guides/import-existing-resume.md](../guides/import-existing-resume.md).

### Which AI provider should I pick?

| Use case                 | Recommended                                   |
| ------------------------ | --------------------------------------------- |
| Best quality             | Anthropic Claude Sonnet or OpenAI GPT-4 class |
| Cheapest, decent quality | DeepSeek                                      |
| Free tier                | Groq (fast, rate-limited) or Mistral free     |
| Fully offline / privacy  | Ollama                                        |
| OpenAI-compatible custom | Custom endpoint                               |

See [getting-started/ai-providers.md](../getting-started/ai-providers.md).

### Why are AI buttons sometimes disabled?

Either no provider is configured, or the app can't reach the configured provider (network down, Ollama not running, etc.). Hover the disabled button for a tooltip explaining the state.

### Can I edit a tailored resume without affecting the MasterResume?

Yes — that's the core product rule. Edits to a tailored resume stay in that application's draft. The MasterResume is unchanged. See [guides/applications.md → Editing boundaries](../guides/applications.md#editing-boundaries--what-changes-where).

### What does "Mark as Ready" do?

Flags the active draft version of a resume or cover letter. The tracker shows a "Resume ready" badge. Doesn't lock the draft — you can still edit. Only one draft per application can be ready at a time.

### Can I export to Word (DOCX)?

Yes. Click Export → DOCX from any resume or cover letter. PDF is recommended for most uses (better fidelity); use DOCX only when a recruiter requires Word.

### Is there a mobile app?

No. Reeesume is a web app. It's responsive — usable on a phone browser — but optimized for desktop. For mobile access, run it in self-hosted mode and open the URL on your phone.

### How do I delete everything?

```bash
# Stop containers and remove the data volume (irreversible)
docker compose down -v
```

Export a backup first if there's any chance you'll want the data later. See [backup-restore.md → Deleting your data](../data-and-privacy/backup-restore.md#deleting-your-data).

### Can I contribute or report a bug?

Yes. See the Contributing section of the root [README.md](../../README.md). Fork, branch, open a PR. Conventional Commits are required.

### Which OS is best for running Reeesume?

Anything Docker supports works. macOS with Apple Silicon is the smoothest experience for local Ollama + Reeesume. Linux is best for self-hosted deployments. Windows works fine via Docker Desktop.

### Does Reeesume support languages other than English?

The UI is in English. MasterResume content can be in any language — your tailored resumes will be in whatever language you write them in. AI providers work in their supported languages.

### What's the difference between local mode and self-hosted mode?

|                  | Local (`AUTH_MODE=none`) | Self-hosted (`AUTH_MODE=email_otp`) |
| ---------------- | ------------------------ | ----------------------------------- |
| Login screen     | No — opens directly      | Yes — email OTP                     |
| Multi-device     | No                       | Yes                                 |
| Setup complexity | Lower                    | Slightly higher (SMTP config)       |
| Use case         | Personal machine         | VPS, home server, multi-device      |

### How much does it cost to run?

The app itself is free and open source (GPL v3). The only ongoing cost is AI provider usage — typically $0.01–0.10 per vacancy analysis or cover letter with cloud providers. Ollama is free. Hosting costs (if self-hosting) depend on your server.
