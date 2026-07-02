# Updating Reeesume

How to pull new versions and apply database migrations.

---

## Postgres credentials changed from `masterresume` to `reeesume`

The Postgres user / password / database name changed from `masterresume` to `reeesume`. The app brand is `Reeesume`; the MasterResume **concept** (your career database, the Prisma `MasterResume` model, the `/master-resume` route) is unchanged.

### For existing local-mode installs

You have two options. **Option A is faster; Option B preserves your data.**

#### Option A — Wipe and start fresh (5 minutes, loses all data)

If you don't have important career data yet, this is the simplest path:

```bash
# Stop containers and remove the data volume
docker compose down -v

# Pull the latest code
git pull

# Start fresh — new container creates a new reeesume user/db
docker compose up --build
```

#### Option B — Rename the existing database (10 minutes, preserves data)

If you have career data you want to keep, rename the existing Postgres role and database to match the new credentials:

```bash
# Stop the app (db stays up)
docker compose stop app

# Connect to Postgres as superuser inside the running container
docker compose exec db psql -U masterresume -d postgres

# Inside psql — rename the role and database
ALTER USER masterresume RENAME TO reeesume;
ALTER USER reeesume WITH PASSWORD 'reeesume';
ALTER DATABASE masterresume RENAME TO reeesume;
\q
```

Then:

```bash
# Pull latest code and restart — connects with new credentials, applies migrations
git pull
docker compose up -d
```

### For native installs

1. Back up your DB: `pg_dump "$DATABASE_URL" > backup.sql`
2. Rename the Postgres role and database (same SQL as Option B above).
3. Update `.env` with the new `DATABASE_URL`.
4. `git pull && npm install && npx prisma migrate deploy && npm run dev`

### If you skip the rename and keep old credentials

That's also valid — edit `.env` to use `masterresume:masterresume@...:5432/masterresume` instead of `reeesume:reeesume@...:5432/reeesume`. The app doesn't care what credentials you use, as long as `.env` matches the running database. New `docker-compose*.yml` files default to `reeesume`.

---

## Before you update: back up

**Strongly recommended:** back up your database before pulling a new minor version. Schema migrations are usually safe, but a backup means you can always roll back.

See [data-and-privacy/backup-restore.md](../data-and-privacy/backup-restore.md) for the exact commands. The 30-second version:

```bash
# Dump the database to a SQL file named with today's date
docker compose exec db pg_dump -U reeesume reeesume > backup-$(date +%F).sql
```

---

## Docker installs

```bash
# Pull the latest code from GitHub
git pull

# Rebuild the image and restart containers — this also runs prisma migrate deploy automatically
docker compose up --build
```

The `command:` line in `docker-compose.yml` runs `prisma migrate deploy` before starting the app, so schema changes apply automatically. You don't need to run any migration commands manually.

Confirm the app is back up: open [http://localhost:3000](http://localhost:3000).

---

## Native installs (Node.js from source)

```bash
# Pull the latest code
git pull

# Install any new or updated dependencies
npm install

# Apply any pending schema migrations
npx prisma migrate dev

# Restart the dev server (Ctrl+C the old one first if still running)
npm run dev
```

If there are no pending migrations, `npx prisma migrate dev` is a no-op — safe to run every time.

For production-mode users, replace the last command:

```bash
# Production rebuild and restart
npm run build && npm run start
```

---

## Breaking changes

- **Minor versions** (e.g. `v1.2` → `v1.3`) — backward compatible. The update flow above just works.
- **Major versions** (e.g. `v1.x` → `v2.0`) — may include breaking migrations or config changes. Always read the [GitHub release notes](https://github.com/strokati/master-resume/releases) before updating across a major version.

---

## Rolling back

If an update breaks something and you need to go back:

1. Stop the app.
2. Restore your pre-update database backup — see [data-and-privacy/backup-restore.md](../data-and-privacy/backup-restore.md#restore-procedure).
3. Check out the previous version of the code:
   ```bash
   # List recent releases and check out a specific tag
   git tag
   git checkout v1.2.0
   ```
4. Restart the app.

Rollbacks only work if your database schema matches the code version. If a migration ran that can't be reversed, you'll need the pre-migration backup.

---

## What about stored AI keys?

If you change `NEXTAUTH_SECRET` between updates (you shouldn't, but if you do), stored AI provider API keys become unreadable — they're encrypted with a key derived from `NEXTAUTH_SECRET`. Just re-enter them in Settings → AI Providers.

If `NEXTAUTH_SECRET` stays the same across updates (the normal case), all your stored keys keep working.
