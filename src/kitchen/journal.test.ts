import { assertEquals } from 'jsr:@std/assert'
import { appendJournalEntry, getRecentCorrections, pruneJournal } from './journal.ts'
import type { Kitchen, JournalEntry } from '../types.ts'

function emptyKitchen(): Kitchen {
  return { equipment: [], recipes: [], pantry: [] }
}

function makeEntry(overrides: Partial<JournalEntry> = {}): JournalEntry {
  return {
    timestamp: new Date().toISOString(),
    recipe: 'Test Recipe',
    step: 1,
    card: 'send-message',
    type: 'executed',
    ...overrides,
  }
}

Deno.test('appendJournalEntry: adds an entry to the journal', () => {
  const kitchen = appendJournalEntry(emptyKitchen(), makeEntry())
  assertEquals(kitchen.journal?.length, 1)
})

Deno.test('appendJournalEntry: creates journal array when kitchen has none', () => {
  const kitchen = emptyKitchen()
  assertEquals(kitchen.journal, undefined)
  const updated = appendJournalEntry(kitchen, makeEntry())
  assertEquals(Array.isArray(updated.journal), true)
})

Deno.test('getRecentCorrections: returns only corrected entries for the given card type', () => {
  const journal: JournalEntry[] = [
    makeEntry({ type: 'executed', card: 'send-message' }),
    makeEntry({ type: 'corrected', card: 'send-message', before: 'a', after: 'b' }),
    makeEntry({ type: 'corrected', card: 'listen', before: 'c', after: 'd' }),
    makeEntry({ type: 'approved', card: 'send-message' }),
  ]
  const result = getRecentCorrections(journal, 'send-message')
  assertEquals(result.length, 1)
  assertEquals(result[0].before, 'a')
})

Deno.test('getRecentCorrections: returns most recent 3 by default', () => {
  const journal: JournalEntry[] = Array.from({ length: 5 }, (_, i) =>
    makeEntry({
      type: 'corrected',
      card: 'send-message',
      before: `before-${i}`,
      after: `after-${i}`,
      timestamp: new Date(2026, 0, i + 1).toISOString(),
    })
  )
  const result = getRecentCorrections(journal, 'send-message')
  assertEquals(result.length, 3)
  assertEquals(result[0].before, 'before-2')
})

Deno.test('getRecentCorrections: respects custom limit', () => {
  const journal: JournalEntry[] = Array.from({ length: 5 }, (_, i) =>
    makeEntry({ type: 'corrected', card: 'send-message', before: `b-${i}`, after: `a-${i}` })
  )
  assertEquals(getRecentCorrections(journal, 'send-message', 2).length, 2)
})

Deno.test('pruneJournal: keeps at most maxPerCard entries per card type', () => {
  const journal: JournalEntry[] = Array.from({ length: 150 }, (_, i) =>
    makeEntry({ timestamp: new Date(2026, 2, 1, 0, 0, i).toISOString() })
  )
  const pruned = pruneJournal(journal, 100)
  assertEquals(pruned.length, 100)
})

Deno.test('pruneJournal: removes entries older than maxAgeDays', () => {
  const old = new Date()
  old.setDate(old.getDate() - 60)
  const recent = new Date()

  const journal: JournalEntry[] = [
    makeEntry({ timestamp: old.toISOString() }),
    makeEntry({ timestamp: recent.toISOString() }),
  ]
  const pruned = pruneJournal(journal, 100, 30)
  assertEquals(pruned.length, 1)
  assertEquals(pruned[0].timestamp, recent.toISOString())
})

Deno.test('pruneJournal: applies both constraints', () => {
  // 10 entries from today, 5 from 60 days ago
  const today = new Date()
  const old = new Date()
  old.setDate(old.getDate() - 60)

  const journal: JournalEntry[] = [
    ...Array.from({ length: 5 }, (_, i) =>
      makeEntry({ timestamp: new Date(old.getTime() + i * 1000).toISOString() })
    ),
    ...Array.from({ length: 10 }, (_, i) =>
      makeEntry({ timestamp: new Date(today.getTime() + i * 1000).toISOString() })
    ),
  ]
  const pruned = pruneJournal(journal, 100, 30)
  assertEquals(pruned.length, 10) // only today's entries survive the age limit
})
