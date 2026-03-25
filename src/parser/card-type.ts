// Shared card-type normalization for all parsers.
// CardType itself lives in types.ts (the domain schema boundary);
// validation and normalization live here in the parser layer.

import type { CardType } from '../types.ts'

// Card types recognised by the system. Anything else is a parse error.
export const KNOWN_CARD_TYPES: readonly CardType[] = ['listen', 'wait', 'send-message']

// Normalise a raw card-type string to a known CardType, or null if unrecognised.
export function normaliseCardType(raw: string): CardType | null {
  const normalised = raw.toLowerCase().replace(/\s+/g, '-')
  return (KNOWN_CARD_TYPES as readonly string[]).includes(normalised)
    ? (normalised as CardType)
    : null
}
