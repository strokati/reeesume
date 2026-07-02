# Set Up Ollama for Fully-Offline AI

[Ollama](https://ollama.com/) runs an AI model on your own computer. No API key, no network calls, free.

**Trade-off:** requires a modern machine with decent RAM, and model quality is below frontier cloud models like GPT-4 or Claude Sonnet.

This is the right choice if you want zero data to leave your machine.

---

## System requirements

- **RAM:** 8 GB minimum, 16 GB recommended. Larger models need more.
- **Disk:** 4–6 GB per model you download.
- **CPU/GPU:** macOS with Apple Silicon (M1/M2/M3/M4) is ideal — Ollama uses the Neural Engine automatically. On Linux/Windows, a recent GPU helps but isn't required.
- **OS:** macOS, Linux, or Windows (via WSL2).

See Ollama's [hardware guidance](https://github.com/ollama/ollama#model-library) for model-specific RAM requirements.

---

## Step 1 — Install Ollama

### macOS

Download the installer from [ollama.com/download](https://ollama.com/download) and drag to Applications.

### Linux

```bash
# One-line installer from Ollama
curl -fsSL https://ollama.com/install.sh | sh
```

### Windows

Use the installer from [ollama.com/download](https://ollama.com/download). WSL2 is recommended for best performance.

---

## Step 2 — Pull a model

Open a terminal and pull a starter model:

```bash
# Pull a general-purpose 8B model (~5 GB download)
ollama pull llama3.1:8b
```

Alternatives:

```bash
# Alternative 8B model — strong reasoning
ollama pull qwen2.5:7b

# Larger models for better quality (need 16+ GB RAM)
ollama pull llama3.1:70b
ollama pull qwen2.5:32b
```

**Smaller models (7-8B parameters)** are fine for rephrasing and short tasks, but struggle with long cover letters and complex multi-section analysis. **Larger models (32B+)** produce noticeably better resumes and cover letters.

---

## Step 3 — Verify Ollama is running

After install, Ollama runs as a background service listening on port 11434. Check it:

```bash
# Hit the Ollama tags endpoint — should return JSON listing your pulled models
curl http://localhost:11434/api/tags
```

Expected output:

```json
{
  "models": [
    {
      "name": "llama3.1:8b",
      "model": "llama3.1:8b",
      ...
    }
  ]
}
```

If you see `Connection refused`, Ollama isn't running. Start it:

- **macOS:** open the Ollama app from Applications.
- **Linux:** `ollama serve` (or it's already running as a systemd service).
- **Windows:** open the Ollama app from the Start menu.

---

## Step 4 — Configure Reeesume

1. Open Reeesume → **Settings** → **AI Providers**.
2. Click **Add Provider**.
3. Pick **Ollama**.
4. Set the **Server URL**:
   - **If you're running Reeesume natively** (no Docker for the app): `http://localhost:11434`
   - **If you're running Reeesume in Docker:** `http://host.docker.internal:11434` — see the gotcha below.
5. Set the **Model ID** to match what you pulled (e.g. `llama3.1:8b`).
6. Save.

### The Docker gotcha (most common issue)

If Reeesume is running in a Docker container, `localhost` from inside the container refers to the container itself — not your host machine where Ollama is running. Use `host.docker.internal` instead, which Docker resolves to your host.

- **Docker Desktop (macOS, Windows):** `http://host.docker.internal:11434` works out of the box.
- **Docker Engine (Linux):** `host.docker.internal` doesn't exist by default. Either:
  - Add `--add-host=host.docker.internal:host-gateway` to your Docker run command, or
  - Run the Reeesume container with `--network=host`, or
  - Use your machine's LAN IP (e.g. `http://192.168.1.100:11434`).

---

## Step 5 — Test it

Go back to Reeesume and run any AI operation:

1. Open an application or your MasterResume.
2. Click any AI button (e.g. **Analyze this posting** or **AI Rephrase**).
3. Pick Ollama as the provider if it isn't already default.
4. The output should stream in like with any cloud provider.

If it works, you now have a fully offline AI-powered resume workflow. **Nothing leaves your machine.**

---

## Choosing the right model size

The model you pick matters more than anything else for output quality:

| Model size | RAM needed | Good for                                          | Struggles with                               |
| ---------- | ---------- | ------------------------------------------------- | -------------------------------------------- |
| 7–8B       | 8 GB       | Rephrasing, short bullets, ATS keyword extraction | Long cover letters, complex vacancy analysis |
| 13–14B     | 16 GB      | Most tasks, including cover letters               | Nuanced multi-section reasoning              |
| 32B        | 24 GB      | High-quality cover letters and analysis           | Slower inference                             |
| 70B        | 32+ GB     | Near-cloud quality                                | Very slow without a strong GPU               |

If your first AI outputs feel weak, try a larger model before assuming the app is broken.

---

## Troubleshooting

- **`Connection refused at localhost:11434`** — Ollama isn't running. Start the Ollama app or run `ollama serve`.
- **`Connection refused` from inside Docker** — you used `localhost` instead of `host.docker.internal`. See Step 4 above.
- **`model not found`** — you typed a model ID that isn't pulled. Check `ollama list` for exact names.
- **Output is poor or hallucinated** — try a larger model. 7B models routinely hallucinate tech keywords they don't understand.
- **Inference is slow** — expected for large models on CPU. Use a smaller model or upgrade hardware.

See also: [troubleshooting/common-issues.md](../troubleshooting/common-issues.md).
