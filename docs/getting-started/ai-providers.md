# AI Providers

Reeesume uses an external AI service for vacancy analysis, resume tailoring, cover letters, ATS checks, and rephrasing. You pick which service, paste an API key, and the app talks to the provider directly.

**There is no Reeesume cloud.** Your data goes straight from your machine to the provider you choose.

---

## Supported providers

Reeesume supports 10 providers. The provider IDs below match what you'll see in Settings → AI Providers:

| Provider          | Cloud / Local | API key required | Cost model                                |
| ----------------- | ------------- | ---------------- | ----------------------------------------- |
| **OpenAI**        | Cloud         | Yes              | Pay per token                             |
| **Anthropic**     | Cloud         | Yes              | Pay per token                             |
| **Google Gemini** | Cloud         | Yes              | Pay per token (free tier available)       |
| **Mistral**       | Cloud         | Yes              | Pay per token (free tier available)       |
| **Groq**          | Cloud         | Yes              | Free tier; rate-limited                   |
| **xAI** (Grok)    | Cloud         | Yes              | Pay per token                             |
| **z.ai** (Zhipu)  | Cloud         | Yes              | Pay per token                             |
| **DeepSeek**      | Cloud         | Yes              | Pay per token — low rates                 |
| **Ollama**        | Local         | No               | Free — runs on your machine               |
| **Custom**        | Either        | Optional         | OpenAI-compatible endpoint of your choice |

---

## Provider details

### OpenAI

- **Get a key:** [platform.openai.com/api-keys](https://platform.openai.com/api-keys). Create an account, add billing, generate a key.
- **Cost:** Pay per token. A typical vacancy analysis costs ~$0.01–0.05 depending on the model.
- **Starter model:** `gpt-4o-mini` (cheap, fast) or `gpt-4o` (higher quality).
- **Notes:** Requires adding a credit card even for the free trial credit.

### Anthropic

- **Get a key:** [console.anthropic.com](https://console.anthropic.com/). Account → API Keys → Create.
- **Cost:** Pay per token. Claude models are competitive with GPT-4 class.
- **Starter model:** `claude-haiku-4-5` (fast, affordable) or `claude-sonnet-4-6` (balanced quality).
- **Notes:** Strong at long-context reasoning — good for full-vacancy analysis.

### Google Gemini

- **Get a key:** [aistudio.google.com](https://aistudio.google.com/) → Get API key.
- **Cost:** Free tier available (rate-limited); paid tier per token.
- **Starter model:** `gemini-2.0-flash` (fast, cheap) or `gemini-2.5-pro` (high quality).
- **Notes:** Requires enabling the Generative Language API in your Google Cloud project.

### Mistral

- **Get a key:** [console.mistral.ai](https://console.mistral.ai/).
- **Cost:** Free tier (small models); paid per token for larger ones.
- **Starter model:** `mistral-small-latest` or `mistral-large-latest`.

### Groq

- **Get a key:** [console.groq.com](https://console.groq.com/).
- **Cost:** Free tier available — extremely fast inference.
- **Starter model:** `llama-3.3-70b-versatile` or `llama-3.1-8b-instant`.
- **Notes:** Best for trying the app without spending money. Rate-limited on free tier.

### xAI (Grok)

- **Get a key:** [console.x.ai](https://console.x.ai/).
- **Cost:** Pay per token.
- **Starter model:** `grok-2` or `grok-2-mini`.
- **Notes:** Requires xAI access approval.

### z.ai (Zhipu / ChatGLM)

- **Get a key:** [open.bigmodel.cn](https://open.bigmodel.cn/).
- **Cost:** Pay per token — competitive rates, especially for Chinese-market users.
- **Starter model:** `glm-4-plus` or `glm-4-flash`.
- **Notes:** Supports two API modes — `openai` (default) or `anthropic`. Pick in the provider settings.

### DeepSeek

- **Get a key:** [platform.deepseek.com](https://platform.deepseek.com/).
- **Cost:** Pay per token — among the lowest rates available.
- **Starter model:** `deepseek-chat` or `deepseek-reasoner`.
- **Notes:** Strong reasoning performance for the price.

### Ollama (local)

- **Get a key:** None needed — runs locally.
- **Cost:** Free.
- **See:** [ollama-offline.md](ollama-offline.md) for the full setup guide.

### Custom (OpenAI-compatible)

- For self-hosted models, internal gateways, or any service that exposes an OpenAI-compatible API.
- Provide the **base URL** and optionally an API key.

---

## How to add a provider in the app

1. Open **Settings** (gear icon in the sidebar).
2. Go to **AI Providers**.
3. Click **Add Provider**.
4. Pick the provider from the dropdown.
5. Paste your API key. (For Ollama, no key — just the server URL.)
6. Pick a model. Type the model ID exactly — the list in the provider's docs is authoritative.
7. Optionally set this provider as **default**.
8. Save.

Your API key is encrypted in the database. The encryption key is derived from `NEXTAUTH_SECRET` (in your `.env`).

---

## Switching providers per task

You can pick a different provider for each AI operation:

- Use a **cheap model** (e.g. Groq + `llama-3.1-8b-instant`) for rephrasing single bullets.
- Use a **strong model** (e.g. Anthropic Claude Sonnet) for full cover-letter generation.
- Use **Ollama** when you're offline or working on sensitive applications.

The provider picker appears next to every AI button.

---

## Cost-saving tips

- **Rephrasing is cheap, generation is expensive.** Use small models for the former.
- **Watch the AI Call Log** in Settings → AI Providers → Logs. Every call is logged with timestamp, provider, model, and operation.
- **Try Ollama for free experimentation.** It costs nothing and is great for learning the workflow before spending API credits.
- **Keep one provider as default** so the app pre-selects it everywhere. Switch only when you need to.

---

## Privacy

When you use a cloud provider, the text you send (job postings, resume bullets, cover letter prompts) goes directly from your machine to that provider's API. Reeesume does not log, intermediate, or store your prompts beyond what the provider itself retains.

For zero data leaving your machine, use [Ollama](ollama-offline.md).

Full privacy posture: [data-and-privacy/privacy.md](../data-and-privacy/privacy.md).
