// Provider-agnostic AI client for the sous chef.
//
// Anthropic: uses the Anthropic SDK (already a dependency, handles auth quirks).
// All other providers: plain fetch against OpenAI-compatible /chat/completions.
// This avoids adding the OpenAI SDK as a dependency while supporting five providers.

import Anthropic from '@anthropic-ai/sdk'
import type { SousChefConfig } from '../types.ts'
import { getProvider } from './providers.ts'

// Make a single AI request and return the text response.
export async function sousChefAsk(
  config: SousChefConfig,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const provider = getProvider(config.provider)
  const model = provider.defaultModel

  if (config.provider === 'anthropic') {
    return anthropicAsk(config.apiKey, model, systemPrompt, userMessage)
  }

  const baseUrl = config.baseUrl ?? provider.apiBaseUrl
  return openAiCompatibleAsk(baseUrl, config.apiKey, model, systemPrompt, userMessage)
}

// --- Anthropic (uses SDK for correct auth headers and error types) ---

async function anthropicAsk(
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })
  const response = await client.messages.create({
    model,
    max_tokens: 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  })
  const block = response.content[0]
  return block.type === 'text' ? block.text : ''
}

// --- OpenAI-compatible (OpenAI, Gemini, Mistral, Ollama) ---

async function openAiCompatibleAsk(
  baseUrl: string,
  apiKey: string,
  model: string,
  systemPrompt: string,
  userMessage: string,
): Promise<string> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  }
  // Ollama runs without a key; passing an empty Authorization header causes errors.
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`
  }

  const response = await fetch(`${baseUrl}/chat/completions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userMessage },
      ],
    }),
  })

  if (!response.ok) {
    const body = await response.json().catch(() => ({}))
    // Throw an Error whose message includes the status code so sousChefError()
    // can map it to a friendly message.
    throw new Error(`${response.status} ${JSON.stringify(body)}`)
  }

  const data = await response.json() as { choices: { message: { content: string } }[] }
  return data.choices[0]?.message?.content ?? ''
}
