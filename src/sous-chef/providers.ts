// Static metadata for each supported AI provider.
// No logic here — just data used by the UI and the client.

import type { SousChefProviderId } from '../types.ts'

export interface ProviderMeta {
  id: SousChefProviderId
  label: string          // display name
  brandColor: string     // subtle brand tint for UI theming
  description: string    // one-line pitch shown in picker
  costNote: string       // "Free tier available" / "Free with your hardware" / "Pay-per-use"
  defaultModel: string   // model used unless overridden
  apiBaseUrl: string     // base URL for API calls (OpenAI-compatible path prefix)
  keyRequired: boolean   // false for Ollama
  keyPlaceholder: string
  keyHint: string        // "Find your key at …"
  keyLink: string        // direct link to the key management page
  localOnly: boolean     // true for Ollama — HTTPS pages can't reach localhost
}

export const PROVIDERS: ProviderMeta[] = [
  {
    id: 'anthropic',
    label: 'Claude',
    brandColor: '#D4A27F',
    description: 'Anthropic\'s Claude — thoughtful, nuanced answers',
    costNote: 'Pay-per-use',
    defaultModel: 'claude-haiku-4-5-20251001',
    apiBaseUrl: '',    // unused — uses Anthropic SDK directly
    keyRequired: true,
    keyPlaceholder: 'sk-ant-api03-…',
    keyHint: 'Get your key at console.anthropic.com/settings/keys',
    keyLink: 'https://console.anthropic.com/settings/keys',
    localOnly: false,
  },
  {
    id: 'openai',
    label: 'ChatGPT',
    brandColor: '#10A37F',
    description: 'OpenAI\'s GPT — widely used, reliable',
    costNote: 'Pay-per-use · free tier available',
    defaultModel: 'gpt-4o-mini',
    apiBaseUrl: 'https://api.openai.com/v1',
    keyRequired: true,
    keyPlaceholder: 'sk-…',
    keyHint: 'Get your key at platform.openai.com/api-keys',
    keyLink: 'https://platform.openai.com/api-keys',
    localOnly: false,
  },
  {
    id: 'gemini',
    label: 'Gemini',
    brandColor: '#4285F4',
    description: 'Google\'s Gemini — generous free tier',
    costNote: 'Free tier available',
    defaultModel: 'gemini-1.5-flash',
    apiBaseUrl: 'https://generativelanguage.googleapis.com/v1beta/openai',
    keyRequired: true,
    keyPlaceholder: 'AIza…',
    keyHint: 'Get your key at aistudio.google.com/app/apikey',
    keyLink: 'https://aistudio.google.com/app/apikey',
    localOnly: false,
  },
  {
    id: 'mistral',
    label: 'Mistral',
    brandColor: '#FF7000',
    description: 'Open-weight models, European-made',
    costNote: 'Free tier available',
    defaultModel: 'mistral-small-latest',
    apiBaseUrl: 'https://api.mistral.ai/v1',
    keyRequired: true,
    keyPlaceholder: '…',
    keyHint: 'Get your key at console.mistral.ai',
    keyLink: 'https://console.mistral.ai',
    localOnly: false,
  },
  {
    id: 'ollama',
    label: 'Local model',
    brandColor: '#888888',
    description: 'Run a model on your own computer — completely free',
    costNote: 'Free · uses your hardware',
    defaultModel: 'llama3.2',
    apiBaseUrl: 'http://localhost:11434/v1',
    keyRequired: false,
    keyPlaceholder: '',
    keyHint: '',
    keyLink: 'https://ollama.com',
    localOnly: true,
  },
]

export function getProvider(id: SousChefProviderId): ProviderMeta {
  const p = PROVIDERS.find(p => p.id === id)
  if (!p) throw new Error(`Unknown provider: ${id}`)
  return p
}
