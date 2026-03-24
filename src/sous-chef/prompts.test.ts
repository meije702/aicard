import { assertEquals } from 'jsr:@std/assert'
import { renderCardPrompt } from './prompts.ts'
import type { PromptContext, JournalEntry } from '../types.ts'

function makeContext(overrides: Partial<PromptContext> = {}): PromptContext {
  return {
    recentCorrections: [],
    stepContext: 'Step: "Send the email"\nCard type: send-message\nSettings:\n  to: emma@example.com',
    ...overrides,
  }
}

Deno.test('renderCardPrompt: includes technique sections when provided', () => {
  const result = renderCardPrompt(makeContext({
    technique: {
      voice: 'You compose messages.',
      constraints: 'Keep under 150 words.',
      expertise: 'You understand email.',
    },
  }))
  assertEquals(result.includes('## Technique'), true)
  assertEquals(result.includes('### Voice'), true)
  assertEquals(result.includes('You compose messages.'), true)
  assertEquals(result.includes('### Constraints'), true)
  assertEquals(result.includes('### Expertise'), true)
})

Deno.test('renderCardPrompt: omits technique when undefined', () => {
  const result = renderCardPrompt(makeContext())
  assertEquals(result.includes('## Technique'), false)
})

Deno.test('renderCardPrompt: includes house style when provided', () => {
  const result = renderCardPrompt(makeContext({ houseStyle: 'Warm and informal.' }))
  assertEquals(result.includes('## House style'), true)
  assertEquals(result.includes('Warm and informal.'), true)
})

Deno.test('renderCardPrompt: omits house style when undefined', () => {
  const result = renderCardPrompt(makeContext())
  assertEquals(result.includes('## House style'), false)
})

Deno.test('renderCardPrompt: includes corrections as few-shot examples', () => {
  const corrections: JournalEntry[] = [
    { timestamp: '2026-01-01T00:00:00Z', recipe: 'test', step: 1, card: 'send-message', type: 'corrected', before: 'Dear Emma', after: 'Hoi Emma' },
    { timestamp: '2026-01-02T00:00:00Z', recipe: 'test', step: 1, card: 'send-message', type: 'corrected', before: 'Regards', after: 'Warme groet' },
  ]
  const result = renderCardPrompt(makeContext({ recentCorrections: corrections }))
  assertEquals(result.includes('## Recent corrections'), true)
  assertEquals(result.includes('1. You wrote: "Dear Emma"'), true)
  assertEquals(result.includes('User changed to: "Hoi Emma"'), true)
  assertEquals(result.includes('2. You wrote: "Regards"'), true)
})

Deno.test('renderCardPrompt: omits corrections when empty', () => {
  const result = renderCardPrompt(makeContext())
  assertEquals(result.includes('## Recent corrections'), false)
})

Deno.test('renderCardPrompt: always includes step context', () => {
  const result = renderCardPrompt(makeContext())
  assertEquals(result.includes('Step: "Send the email"'), true)
})

Deno.test('renderCardPrompt: assembles in correct order', () => {
  const result = renderCardPrompt(makeContext({
    technique: { voice: 'VOICE_MARKER', constraints: 'CONSTRAINTS_MARKER', expertise: 'EXPERTISE_MARKER' },
    houseStyle: 'HOUSESTYLE_MARKER',
    recentCorrections: [
      { timestamp: '2026-01-01T00:00:00Z', recipe: 'test', step: 1, card: 'send-message', type: 'corrected', before: 'a', after: 'b' },
    ],
  }))
  const techniqueIdx = result.indexOf('VOICE_MARKER')
  const houseStyleIdx = result.indexOf('HOUSESTYLE_MARKER')
  const correctionsIdx = result.indexOf('Recent corrections')
  const stepIdx = result.indexOf('Step: "Send the email"')
  assertEquals(techniqueIdx < houseStyleIdx, true, 'technique before house style')
  assertEquals(houseStyleIdx < correctionsIdx, true, 'house style before corrections')
  assertEquals(correctionsIdx < stepIdx, true, 'corrections before step context')
})
