import { assertEquals } from 'jsr:@std/assert'
import { extractOptions, buildHatOptions } from './sous-chef.ts'

// --- extractOptions ---

Deno.test('extractOptions: parses clean JSON response', () => {
  const raw = '{"options": ["Check readiness", "Start a new recipe"]}'
  assertEquals(extractOptions(raw), ['Check readiness', 'Start a new recipe'])
})

Deno.test('extractOptions: strips ```json fences', () => {
  const raw = '```json\n{"options": ["Option A", "Option B"]}\n```'
  assertEquals(extractOptions(raw), ['Option A', 'Option B'])
})

Deno.test('extractOptions: extracts JSON embedded in surrounding text', () => {
  const raw = 'Here are some options:\n{"options": ["One", "Two"]}\nHope that helps!'
  assertEquals(extractOptions(raw), ['One', 'Two'])
})

Deno.test('extractOptions: falls back to line parsing for plain text', () => {
  const raw = '- Check if ready\n- Start recipe\n- Ask something'
  const result = extractOptions(raw)
  assertEquals(result.includes('Check if ready'), true)
  assertEquals(result.includes('Start recipe'), true)
})

Deno.test('extractOptions: limits to 5 options', () => {
  const options = Array.from({ length: 8 }, (_, i) => `Option ${i + 1}`)
  const raw = JSON.stringify({ options })
  assertEquals(extractOptions(raw).length, 5)
})

// --- buildHatOptions: structural guarantees ---

Deno.test('buildHatOptions: wraps LLM labels as plain options', () => {
  const result = buildHatOptions(['Check readiness'], false)
  assertEquals(result[0].label, 'Check readiness')
  assertEquals(result[0].action, undefined)
})

Deno.test('buildHatOptions: always appends ask-anything as last option', () => {
  const result = buildHatOptions(['A', 'B'], false)
  const last = result[result.length - 1]
  assertEquals(last.action, 'ask-anything')
  assertEquals(last.label, 'I want to ask something else')
})

Deno.test('buildHatOptions: appends tour option when recipe is open', () => {
  const result = buildHatOptions(['A'], true)
  const tour = result.find(o => o.action === 'tour')
  assertEquals(tour !== undefined, true, 'Tour option should be present')
  assertEquals(tour!.label, 'Walk me through this recipe')
})

Deno.test('buildHatOptions: tour comes before ask-anything', () => {
  const result = buildHatOptions(['A'], true)
  const tourIndex = result.findIndex(o => o.action === 'tour')
  const askIndex = result.findIndex(o => o.action === 'ask-anything')
  assertEquals(tourIndex < askIndex, true, `tour (${tourIndex}) should come before ask-anything (${askIndex})`)
})

Deno.test('buildHatOptions: no tour option when no recipe is open', () => {
  const result = buildHatOptions(['A', 'B'], false)
  const tour = result.find(o => o.action === 'tour')
  assertEquals(tour, undefined, 'Tour option should not be present without a recipe')
})

Deno.test('buildHatOptions: empty LLM labels still produce tour and ask-anything', () => {
  const result = buildHatOptions([], true)
  assertEquals(result.length, 2)
  assertEquals(result[0].action, 'tour')
  assertEquals(result[1].action, 'ask-anything')
})
