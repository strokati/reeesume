# Backup and Restore

Your data lives in PostgreSQL. Docker volumes don't move with the container — if you delete the volume, your data is gone. The app does not have built-in cloud backup.

This guide gives you **copy-pasteable commands** for safe backup and restore.

---

## Why back up

- **Updates** — schema migrations usually run cleanly, but a backup means you can always roll back.
- **Hardware failure** — disks die. Volumes die with them.
- **Accidental deletion** — `docker compose down -v` removes everything. So does `npx prisma migrate reset`.
- **Moving to a new machine** — you'll want your career database to come with you.

Backups are cheap. Data loss is expensive. Do it.

---

## Backup method A — SQL dump (recommended)

The most portable format. Works across Postgres versions and across Docker / native installs.

### For Docker installs

```bash
# Dump the database to a file named backup-YYYY-MM-DD.sql in the current folder
docker compose exec db pg_dump -U reeesume reeesume > backup-$(date +%F).sql
```

What each part does:

- `docker compose exec db` — run a command inside the running `db` container
- `pg_dump -U reeesume reeesume` — dump the `master-resume` database as user `master-resume`
- `> backup-$(date +%F).sql` — redirect the dump to a file named with today's date

The credentials match `docker-compose.yml`. The resulting file is plain SQL — readable, version-controllable, restore-able anywhere.

### For native installs

Replace the connection string with your `DATABASE_URL`:

```bash
# Dump using connection string from .env (set DATABASE_URL first or substitute inline)
pg_dump "postgresql://user:password@host:5432/dbname" > backup-$(date +%F).sql
```

If you're using `docker-compose.dev.yml` for the database only:

```bash
# Dump from the dev database container
docker compose -f docker-compose.dev.yml exec db pg_dump -U reeesume reeesume > backup-$(date +%F).sql
```

---

## Backup method B — Volume copy

Backs up the raw Postgres data directory. Faster than `pg_dump` for large databases, but **less portable** — the copy only works with the same major version of Postgres.

```bash
# Stop the app so no writes are in flight
docker compose down

# Tar the volume's contents to a file
docker run --rm \
  -v reeesume_postgres_data:/data \
  -v "$PWD":/backup \
  alpine \
  tar czf /backup/postgres-data-$(date +%F).tar.gz /data
```

What each part does:

- `docker compose down` — stop containers (volume data is preserved)
- `docker run --rm ... alpine` — start a temporary Alpine Linux container
- `-v reeesume_postgres_data:/data` — mount the Postgres volume at `/data` inside the temp container
- `-v "$PWD":/backup` — mount the current directory at `/backup` so the tarball lands in your project folder
- `tar czf /backup/postgres-data-...tar.gz /data` — compress the volume into a tarball

Restart with `docker compose up -d` after the backup completes.

---

## Recommended approach

Do **both**:

1. Daily SQL dump (small, portable, automatic via cron).
2. Weekly volume copy (faster restore if you need it).

Store backups **off-machine** — push the SQL dumps to a cloud bucket, external drive, or another computer. A backup on the same disk as the data isn't a backup.

---

## Restore procedure

### Restoring an SQL dump (method A)

```bash
# Stop the app (so nothing writes during restore)
docker compose down

# Start just the database
docker compose up -d db

# Restore from a specific dump file (replace the date with your backup's date)
cat backup-2026-07-01.sql | docker compose exec -T db psql -U reeesume reeesume

# Bring the app back up
docker compose up -d
```

The `-T` flag on `docker compose exec` is important — it disables pseudo-TTY allocation so the SQL stream pipes through cleanly.

### Restoring a volume copy (method B)

```bash
# Stop the app
docker compose down

# Replace the volume's contents with the backup
docker run --rm \
  -v reeesume_postgres_data:/data \
  -v "$PWD":/backup \
  alpine \
  sh -c "rm -rf /data/* && tar xzf /backup/postgres-data-2026-07-01.tar.gz -C /"

# Start the app
docker compose up -d
```

---

## Automation

Set up a daily cron job. On macOS or Linux:

```bash
# Edit your crontab
crontab -e
```

Add a line like:

```cron
# Run a daily SQL dump at 3:17 AM — off the top of the hour to avoid everyone-else's cron jobs
17 3 * * * cd /path/to/master-resume && docker compose exec -T db pg_dump -U reeesume reeesume > /path/to/backups/master-resume-$(date +\%F).sql
```

Note: `%` must be escaped as `\%` in crontab.

For off-machine sync, append a step to push to S3, rsync to a NAS, etc.

---

## Verifying a backup

A backup you haven't tested restoring is just a hypothesis. Verify periodically:

```bash
# Quick check — the first lines should be SQL, not an error message
head -20 backup-2026-07-01.sql
```

For full confidence, restore to a throwaway database and count rows:

```bash
# Start a temporary Postgres container on a different port
docker run -d --name pg-verify -p 5433:5432 -e POSTGRES_PASSWORD=test postgres:16-alpine

# Restore your backup into it
cat backup-2026-07-01.sql | docker exec -i pg-verify psql -U postgres

# Count rows in major tables
docker exec pg-verify psql -U postgres -c \
  "SELECT 'applications' AS table, COUNT(*) FROM applications
   UNION ALL SELECT 'master_resumes', COUNT(*) FROM master_resumes;"
```

When you're done, throw away the verification container:

```bash
docker rm -f pg-verify
```

---

## What is NOT backed up by these methods

- **Your `.env` file** — back it up separately. Store it somewhere safe (password manager, encrypted note). Without `NEXTAUTH_SECRET`, encrypted AI keys can't be decrypted after a restore.
- **AI Call Logs** — these ARE in the database, so they ARE backed up.
- **Configured API keys** — backed up with the database, but only restorable if `NEXTAUTH_SECRET` is preserved.
- **Source code** — already version-controlled in git.

---

## Deleting your data

If you want to wipe everything:

```bash
# Stop the app and remove the volume entirely (irreversible)
docker compose down -v
```

For native installs with the dev database:

```bash
# Wipe the dev database volume
docker compose -f docker-compose.dev.yml down -v
```

For schema-only resets (keeps volume, wipes tables):

```bash
# Drop and recreate all tables, then re-seed (dev only — blocked by settings in production)
npx prisma migrate reset
```

All of these are irreversible. Export a backup first.
