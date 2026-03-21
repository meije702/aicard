// SVG logos for each AI provider.
// Simple, recognizable silhouettes that work at 32-48px.
// Use currentColor so they adapt to light/dark themes.

import type { SousChefProviderId } from '../types.ts'

interface LogoProps {
  size?: number
  className?: string
}

// Anthropic — the starburst / sunburst mark
export function AnthropicLogo({ size = 32, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M13.827 3.52l5.51 16.96H22L14.314 3.52h-0.487zM2 20.48h2.663l1.377-4.222h6.32L13.737 20.48H16.4L10.814 3.52H9.586L2 20.48zm4.878-6.562L9.2 7.064l2.322 6.854H6.878z" />
    </svg>
  )
}

// OpenAI — the hexagonal flower / knot mark
export function OpenAILogo({ size = 32, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.998 5.998 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973V11.6a.766.766 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855l-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023l-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135l-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08L8.704 5.46a.795.795 0 0 0-.393.681zm1.097-2.365l2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
    </svg>
  )
}

// Google Gemini — the four-pointed sparkle
export function GeminiLogo({ size = 32, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 0C12 6.627 6.627 12 0 12c6.627 0 12 5.373 12 12 0-6.627 5.373-12 12-12-6.627 0-12-5.373-12-12z" />
    </svg>
  )
}

// Mistral — the three-bar wind mark
export function MistralLogo({ size = 32, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <rect x="2" y="4" width="4" height="4" />
      <rect x="10" y="4" width="4" height="4" />
      <rect x="18" y="4" width="4" height="4" />
      <rect x="2" y="10" width="4" height="4" />
      <rect x="6" y="10" width="4" height="4" />
      <rect x="10" y="10" width="4" height="4" />
      <rect x="14" y="10" width="4" height="4" />
      <rect x="18" y="10" width="4" height="4" />
      <rect x="2" y="16" width="4" height="4" />
      <rect x="18" y="16" width="4" height="4" />
    </svg>
  )
}

// Ollama — the llama silhouette
export function OllamaLogo({ size = 32, className }: LogoProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 2C9.8 2 8 3.8 8 6c0 1.1.4 2.1 1.2 2.8C7.3 10 6 12.2 6 14.8V20c0 1.1.9 2 2 2h1v-4c0-.6.4-1 1-1s1 .4 1 1v4h2v-4c0-.6.4-1 1-1s1 .4 1 1v4h1c1.1 0 2-.9 2-2v-5.2c0-2.6-1.3-4.8-3.2-6C15.6 8.1 16 7.1 16 6c0-2.2-1.8-4-4-4zm-1.5 5a1 1 0 1 1 0-2 1 1 0 0 1 0 2zm3 0a1 1 0 1 1 0-2 1 1 0 0 1 0 2z" />
    </svg>
  )
}

const LOGO_MAP: Record<SousChefProviderId, (props: LogoProps) => JSX.Element> = {
  anthropic: AnthropicLogo,
  openai: OpenAILogo,
  gemini: GeminiLogo,
  mistral: MistralLogo,
  ollama: OllamaLogo,
}

export function getProviderLogo(id: SousChefProviderId): (props: LogoProps) => JSX.Element {
  return LOGO_MAP[id]
}
