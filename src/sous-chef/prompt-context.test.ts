import { assertEquals, assertExists } from 'jsr:@std/assert'
import { buildPromptContext } from './prompt-context.ts'
import type { Kitchen, Technique } from '../types.ts'

const technique: Technique = {
  voice: 'You compose messages.',
  constraints: 'Keep under 150 words.',
  expertise: 'You understand email etiquette.',
}

function makeKitchen(overrides: Partial<Kitchen> = {}): Kitchen {
  return {
    equipment: [],
    recipes: [],
    pantry: [{
      name: 'Send Message',
      type: 'send-message',
      purpose: 'Sends a message.',
      equipment: [],
      configFields: [],
      technique,
    }],
    ...overrides,
  }
}

Deno.test('buildPromptContext: includes technique from pantry', () => {
  const ctx = buildPromptContext(makeKitchen(), 'send-message', 'Step context here')
  assertExists(ctx.technique)
  assertEquals(ctx.technique.voice, 'You compose messages.')
})

Deno.test('buildPromptContext: technique is undefined for card not in pantry', () => {
  const ctx = buildPromptContext(makeKitchen(), 'wait', 'Step context here')
  assertEquals(ctx.technique, undefined)
})

Deno.test('buildPromptContext: includes house style from kitchen', () => {
  const ctx = buildPromptContext(
    makeKitchen({ houseStyle: 'Warm and informal.' }),
    'send-message',
    'Step context here',
  )
  assertEquals(ctx.houseStyle, 'Warm and informal.')
})

Deno.test('buildPromptContext: house style is undefined when not set', () => {
  const ctx = buildPromptContext(makeKitchen(), 'send-message', 'Step context here')
  assertEquals(ctx.houseStyle, undefined)
})

Deno.test('buildPromptContext: includes recent corrections from journal', () => {
  const kitchen = makeKitchen({
    journal: [
      { timestamp: '2026-01-01T00:00:00Z', recipe: 'test', step: 1, card: 'send-message', type: 'corrected', before: 'Dear Emma', after: 'Hoi Emma' },
      { timestamp: '2026-01-02T00:00:00Z', recipe: 'test', step: 1, card: 'send-message', type: 'executed' },
      { timestamp: '2026-01-03T00:00:00Z', recipe: 'test', step: 1, card: 'send-message', type: 'corrected', before: 'Regards', after: 'Warme groet' },
    ],
  })
  const ctx = buildPromptContext(kitchen, 'send-message', 'Step context')
  assertEquals(ctx.recentCorrections.length, 2)
  assertEquals(ctx.recentCorrections[0].after, 'Hoi Emma')
})

Deno.test('buildPromptContext: corrections are empty when no journal', () => {
  const ctx = buildPromptContext(makeKitchen(), 'send-message', 'Step context')
  assertEquals(ctx.recentCorrections.length, 0)
})

Deno.test('buildPromptContext: always includes step context', () => {
  const ctx = buildPromptContext(makeKitchen(), 'send-message', 'This is the step context')
  assertEquals(ctx.stepContext, 'This is the step context')
})
