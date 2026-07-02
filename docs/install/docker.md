# Install with Docker (Local Mode)

**Recommended path for most users.** Single machine, no login screen, app opens directly.

If you want multi-device access with email login, see [docker-self-hosted.md](docker-self-hosted.md) instead.

---

## What you'll need

- 5–10 minutes (the first build takes most of this)
- Docker installed and working — see [system-requirements.md](system-requirements.md)
- The repository URL (typically `https://github.com/strokati/master-resume.git`)

---

## Step 1 — Get the code

Open a terminal in the folder where you want Reeesume to live, then:

```bash
# Download the project from GitHub
git clone https://github.com/strokati/master-resume.git

# Move into the project folder
cd master-resume
```

If you're installing from a fork or different URL, replace the URL above with yours.

---

## Step 2 — Configure environment

```bash
# Copy the example settings file to .env (your actual settings)
cp .env.example .env
```

**That's it.** Local mode works with the defaults — nothing to edit.

The `.env` file is read by Docker Compose when the app starts. The defaults set:

- `AUTH_MODE=none` — no login screen
- `DATABASE_URL` — points at the bundled Postgres container
- `NEXTAUTH_URL=http://localhost:3000` — the URL you'll open in your browser

---

## Step 3 — Start the app

```bash
# Build the images and start the containers (first run takes 5–15 minutes)
docker compose up --build
```

**First run is slow** because Docker downloads the base images and runs `npm install`. Subsequent starts take seconds.

### What success looks like

The terminal will scroll through build output. When the app is ready, you'll see a line like:

```
app-1  | ▲ Next.js 16.x.x
app-1  | - Local: http://localhost:3000
app-1  | ✓ Ready in 1200ms
```

Leave this terminal open. The app runs as long as the terminal is open.

---

## Step 4 — Open the app

Open your browser at [http://localhost:3000](http://localhost:3000).

You should see the Reeesume dashboard. **No login screen** — local mode skips authentication.

Your user ID is `local-user`. A user record is auto-created on first request.

---

## Step 5 — Stop the app

To stop Reeesume, press `Ctrl+C` in the terminal where it's running.

Your data is **not lost** when you stop. It lives in a Docker volume (`postgres_data`, defined in `docker-compose.yml`) and persists across restarts.

To start it again later:

```bash
# From the project folder
docker compose up
```

(No `--build` needed after the first time.)

---

## Running in the background (optional)

If you want your terminal back, run Reeesume detached:

```bash
# Start containers in the background
docker compose up -d
```

Useful commands while running detached:

```bash
# Tail the live app logs
docker compose logs -f app

# Stop the containers
docker compose down
```

---

## Next steps

The app is running — now configure an AI provider and create your first application:

→ [Getting started: first-run walkthrough](../getting-started/first-run.md)

---

## Common pitfalls

If something goes wrong, see [troubleshooting/common-issues.md](../troubleshooting/common-issues.md). The most common issues on first install are:

- **Port 3000 already in use** — another process is using it. Find and stop it, or change the port in `docker-compose.yml`.
- **Build fails with network error** — your first run needs internet. Check the connection and retry.
- **Build fails on `npm audit`** — the project fails builds on known high/critical vulnerabilities. Update the offending package or pin a clean version.
