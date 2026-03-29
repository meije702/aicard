// Built-in card definitions, parsed from the bundled .card.md fixtures.
// Vite's ?raw import gives us the file contents as strings at build time.
// The browser never touches the filesystem — everything is inlined.

import listenRaw from './listen.card.md?raw'
import waitRaw from './wait.card.md?raw'
import sendMessageRaw from './send-message.card.md?raw'
import { parseCard } from '../../parser/card-parser.ts'
import type { CardDefinition } from '../../types.ts'

function parseOrThrow(raw: string, filename: string): CardDefinition {
  const result = parseCard(raw)
  if (!result.success) {
    throw new Error(`Failed to parse built-in card ${filename}: ${result.errors.join(', ')}`)
  }
  return result.card
}

export const builtInCards: CardDefinition[] = [
  parseOrThrow(listenRaw, 'listen.card.md'),
  parseOrThrow(waitRaw, 'wait.card.md'),
  parseOrThrow(sendMessageRaw, 'send-message.card.md'),
]
