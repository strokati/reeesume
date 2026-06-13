export const PROVIDER_REGISTRY = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-4.1', 'gpt-4.1-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  },
  { id: 'google', name: 'Google', models: ['gemini-2.5-pro', 'gemini-2.5-flash'] },
  {
    id: 'mistral',
    name: 'Mistral',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
  },
  { id: 'groq', name: 'Groq', models: ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'] },
  { id: 'xai', name: 'xAI', models: ['grok-4.3', 'grok-4.1-fast'] },
  {
    id: 'zai',
    name: 'Z.ai',
    models: ['glm-5.1', 'glm-5', 'glm-5-turbo', 'glm-4.7', 'glm-4.7-flash'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat', 'deepseek-reasoner'],
  },
  { id: 'ollama', name: 'Ollama (Local)', models: ['llama3.2', 'qwen2.5-coder', 'mistral'] },
  { id: 'custom', name: 'Custom (OpenAI-compatible)', models: [] },
] as const;

export type ProviderId = (typeof PROVIDER_REGISTRY)[number]['id'];
