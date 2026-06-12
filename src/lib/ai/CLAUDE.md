# AI Layer — Conventions

## Architecture

All AI calls go directly from the Next.js server to the provider. No intermediary backend.

```
Client hook (TanStack/useCompletion)
  → API route (src/app/api/ai/[operation]/route.ts)
    → Operation module (src/lib/ai/operations/[name].ts)
      → getProvider() / getProviderForUser() from providers.ts
```

## Adding a new AI operation

Use `/new-ai-operation` slash command or follow this checklist:

1. **Prompt template** — `src/lib/ai/prompts/[name].ts` — export a const string.
2. **Operation module** — `src/lib/ai/operations/[name].ts` — import `streamText` from `ai`, call `getProvider()`.
3. **API route** — `src/app/api/ai/[name]/route.ts` — auth guard + Zod validation + `result.toDataStreamResponse()`.
4. **Client hook** — `src/hooks/use-[name].ts` — use `useCompletion` or `useChat` from `ai/react`.

## Provider registry (`providers.ts`)

- Reads config from `AiProviderConfig` table (user-managed in Settings).
- Supported IDs: `openai`, `anthropic`, `google`, `mistral`, `groq`, `xai`, `zai`, `deepseek`, `ollama`, `custom`.
- `getProvider()` takes a `ProviderConfig` object. `getProviderForUser()` reads from DB + decrypts API key.
- Ollama uses local URL (`http://localhost:11434/v1`) — no data leaves the machine.
- Custom provider is OpenAI-compatible — requires `baseUrl` and optional `apiKey`.

## Streaming pattern

```ts
import { streamText } from 'ai';
import { getProviderForUser } from '@/lib/ai/providers';

export async function myOperation(userId: string, input: MyInput) {
  const { model } = await getProviderForUser(userId, input.providerId);
  return streamText({ model, system: SYSTEM_PROMPT, prompt: input.text });
}
```

Route handler returns `result.toDataStreamResponse()`. Client consumes via `useCompletion`.

## UI conventions for AI features

- **Blue** = original master data
- **Orange** = AI-suggested content
- **Green** = manually edited content
- Every AI button must be visible but **disabled** when no provider is configured or app is offline.
- Show "Configure AI provider in Settings" as disabled-state tooltip.

## Testing

- AI operation tests live in `src/lib/ai/__tests__/`.
- Mock `getProvider` to return a deterministic model — do not call real APIs in tests.
