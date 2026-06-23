export type ApiMode = 'openai' | 'anthropic';

export type ProviderRegistryEntry = {
  id: string;
  name: string;
  models: readonly string[];
  apiModes?: readonly ApiMode[];
  anthropicModels?: readonly string[];
};

export const PROVIDER_REGISTRY: readonly ProviderRegistryEntry[] = [
  {
    id: 'openai',
    name: 'OpenAI',
    models: ['gpt-5.5', 'gpt-5.4', 'gpt-5.4-mini', 'gpt-5.4-nano', 'gpt-4.1', 'gpt-4.1-mini'],
  },
  {
    id: 'anthropic',
    name: 'Anthropic',
    models: ['claude-opus-4-8', 'claude-opus-4-7', 'claude-sonnet-4-6', 'claude-haiku-4-5'],
  },
  {
    id: 'google',
    name: 'Google',
    models: ['gemini-3.1-pro-preview', 'gemini-3.1-flash', 'gemini-2.5-pro', 'gemini-2.5-flash'],
  },
  {
    id: 'mistral',
    name: 'Mistral',
    models: ['mistral-large-latest', 'mistral-medium-latest', 'mistral-small-latest'],
  },
  {
    id: 'groq',
    name: 'Groq',
    models: [
      'openai/gpt-oss-120b',
      'openai/gpt-oss-20b',
      'meta-llama/llama-4-scout-17b-16e-instruct',
      'llama-3.3-70b-versatile',
      'llama-3.1-8b-instant',
    ],
  },
  { id: 'xai', name: 'xAI', models: ['grok-4.3'] },
  {
    id: 'zai',
    name: 'Z.ai',
    models: ['glm-5.2', 'glm-5.1', 'glm-4.7', 'glm-4.7-flash'],
    apiModes: ['openai', 'anthropic'],
    anthropicModels: ['glm-4.5-air', 'glm-5.2', 'glm-5.1'],
  },
  {
    id: 'deepseek',
    name: 'DeepSeek',
    models: ['deepseek-v4-pro', 'deepseek-v4-flash', 'deepseek-chat', 'deepseek-reasoner'],
  },
  {
    id: 'ollama',
    name: 'Ollama (Local)',
    models: ['llama3.2', 'qwen2.5-coder', 'deepseek-r1'],
  },
  { id: 'custom', name: 'Custom (OpenAI-compatible)', models: [] },
];

export type ProviderId = (typeof PROVIDER_REGISTRY)[number]['id'];
