// Provider-agnostic AI client for the sous chef.
//
// Anthropic: uses the Anthropic SDK (already a dependency, handles auth quirks).
// All other providers: plain fetch against OpenAI-compatible /chat/completions.
// This avoids adding the OpenAI SDK as a dependency while supporting five providers.

import Anthropic from '@anthropic-ai/sdk'
import type { SousChefConfig } from '../types.ts'
import { getProvider } from './providers.ts'

// Optional image attachment for vision requests.
export interface VisionImage {
  base64: string
  mediaType: 'image/jpeg' | 'image/png' | 'image/gif' | 'image/webp'
}

// Make a single AI request and return the text response.
// Pass an optional image for vision requests (Anthropic provider only).
export async function sousChefAsk(
  config: SousChefConfig,
  systemPrompt: string,
  userMessage: string,
  image?: VisionImage,
): Promise<string> {
  const provider = getProvider(config.provider)
  const model = config.model ?? provider.defaultModel

  if (config.provider === 'anthropic') {
    return anthropicAsk(config.apiKey, model, systemPrompt, userMessage, image)
  }

  if (image) {
    throw new Error('Vision is only supported with the Anthropic provider.')
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
  image?: VisionImage,
): Promise<string> {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  // Build content blocks — text-only unless an image is provided.
  const content: Anthropic.MessageCreateParams['messages'][0]['content'] = image
    ? [
        { type: 'image', source: { type: 'base64', media_type: image.mediaType, data: image.base64 } },
        { type: 'text', text: userMessage },
      ]
    : userMessage

  const response = await client.messages.create({
    model,
    max_tokens: image ? 2048 : 1024,
    system: systemPrompt,
    messages: [{ role: 'user', content }],
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
