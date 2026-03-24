// Kitchen journal: pure functions for the append-only execution log.
// The journal records what happened, what the user corrected, and what was approved.
// See docs/AICard_Techniques.md for the design.

import type { Kitchen, CardType, JournalEntry } from '../types.ts'

const DEFAULT_MAX_PER_CARD = 100
const DEFAULT_MAX_AGE_DAYS = 30

// Append a journal entry and prune to stay within retention limits.
export function appendJournalEntry(kitchen: Kitchen, entry: JournalEntry): Kitchen {
  const journal = [...(kitchen.journal ?? []), entry]
  return { ...kitchen, journal: pruneJournal(journal) }
}

// Get the most recent corrections for a specific card type.
// Used as few-shot examples in the sous chef's prompt.
export function getRecentCorrections(
  journal: JournalEntry[],
  cardType: CardType,
  limit = 3,
): JournalEntry[] {
  return journal
    .filter(e => e.card === cardType && e.type === 'corrected')
    .slice(-limit)
}

// Enforce retention: keep at most maxPerCard entries per card type,
// and remove entries older than maxAgeDays.
export function pruneJournal(
  journal: JournalEntry[],
  maxPerCard = DEFAULT_MAX_PER_CARD,
  maxAgeDays = DEFAULT_MAX_AGE_DAYS,
): JournalEntry[] {
  const cutoff = new Date()
  cutoff.setDate(cutoff.getDate() - maxAgeDays)
  const cutoffISO = cutoff.toISOString()

  // Remove old entries first
  const recent = journal.filter(e => e.timestamp >= cutoffISO)

  // Then enforce per-card limit (keep the most recent)
  const byCard = new Map<string, JournalEntry[]>()
  for (const entry of recent) {
    const list = byCard.get(entry.card) ?? []
    list.push(entry)
    byCard.set(entry.card, list)
  }

  const result: JournalEntry[] = []
  for (const [, entries] of byCard) {
    result.push(...entries.slice(-maxPerCard))
  }

  // Maintain chronological order
  result.sort((a, b) => a.timestamp.localeCompare(b.timestamp))
  return result
}
