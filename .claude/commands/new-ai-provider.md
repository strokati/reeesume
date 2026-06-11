# New AI Provider

Add a new AI provider to the provider registry and settings UI.

## Arguments

$ARGUMENTS — provider name and SDK package, e.g. `cohere using @ai-sdk/cohere` or `together using @ai-sdk/openai-compatible`

## Steps to follow

### 1. Install the SDK (if a dedicated package exists)

```bash
npm install --save-exact @ai-sdk/[provider-name]
```

If the provider is OpenAI-compatible (uses `/v1/chat/completions`), no new package is needed — use `@ai-sdk/openai` with a custom `baseURL`.

### 2. Add to provider registry in `src/lib/ai/providers.ts`

#### a) Import the SDK factory (if dedicated package)

```ts
import { createCohere } from '@ai-sdk/cohere';
```

#### b) Add a case to `getProvider()` switch

```ts
case 'cohere':
  return createCohere()(model);
```

For OpenAI-compatible providers:

```ts
case 'together':
  return createOpenAI({
    baseURL: baseUrl || 'https://api.together.xyz/v1',
    apiKey: apiKey || process.env.TOGETHER_API_KEY,
  })(model);
```

#### c) Add env key mapping in `getProviderForUser()` (if the provider uses env vars)

```ts
const envKeyMap: Record<string, string> = {
  // ...existing entries
  cohere: 'COHERE_API_KEY',
};
```

#### d) Add to `PROVIDER_REGISTRY` array

```ts
{
  id: 'cohere',
  name: 'Cohere',
  models: ['command-r-plus', 'command-r'],
}
```

### 3. Update Settings UI

The provider dropdown reads from `PROVIDER_REGISTRY` — no separate UI change needed if the registry entry is correct.

### 4. Test

- Verify the provider appears in Settings > AI Providers.
- Configure an API key and select a model.
- Test with an existing AI operation (e.g., rephrase) to confirm streaming works.
