# System Requirements

What you need before installing Reeesume.

---

## Operating system

Reeesume runs inside Docker, so the host operating system mostly doesn't matter. Supported:

- **macOS** 12 (Monterey) or newer — Intel or Apple Silicon
- **Windows** 10 or 11 — WSL2 recommended (Docker Desktop installs it for you)
- **Linux** — any modern distribution with kernel 5.10+ (Ubuntu 22.04+, Debian 12+, Fedora 39+)

---

## Docker

You need Docker with the `docker compose` plugin.

### macOS and Windows — Docker Desktop

Download from [docker.com](https://www.docker.com/products/docker-desktop/). Open the installer and follow the prompts. Docker Desktop includes `docker compose` automatically.

### Linux — Docker Engine

Install Docker Engine and the `docker-compose-plugin` for your distribution. See Docker's [official install guide](https://docs.docker.com/engine/install/).

### Check it works

Open a terminal and run:

```bash
# Print Docker and Compose versions — both should print a version number
docker --version && docker compose version
```

You should see two version lines. If either is missing, Docker isn't installed correctly.

---

## Disk space

At least **2 GB free**:

- ~1.2 GB for the app image (Node.js, Chromium for PDF export, dependencies)
- ~500 MB for the Postgres image
- ~200 MB for your actual data (grows slowly over time)

---

## Memory (RAM)

At least **2 GB free** for the containers. Recommended: 4 GB.

The app container includes Chromium for PDF export, which is memory-hungry during export. If PDF export crashes with no error, increase Docker's memory limit (Docker Desktop: Settings → Resources).

---

## Network

- **First run** needs internet access to:
  - Pull the Postgres image from Docker Hub
  - Build the app image (downloads npm packages)
- **After install**, the app runs fully offline if you use [Ollama for AI](../getting-started/ollama-offline.md).
- **Cloud AI providers** (OpenAI, Anthropic, etc.) require internet every time you run an AI operation.

---

## Browser

Any modern browser works:

- Chrome, Firefox, Safari, Edge — current and previous major version

PDF export uses an in-container Chromium, so your browser doesn't need anything special.

---

## Git

Required to clone the repository.

```bash
# macOS — install via Homebrew
brew install git

# Windows — download from https://git-scm.com/download/win

# Linux (Debian/Ubuntu)
sudo apt update && sudo apt install -y git
```

---

## Quick check

Run all the version checks at once:

```bash
# Print versions for git, docker, and docker compose
git --version && docker --version && docker compose version
```

All three should print without error. If any fail, revisit the section above.

When everything passes, head to [docker.md](docker.md) for the recommended install path.
