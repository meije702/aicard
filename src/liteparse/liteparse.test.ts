// Tests for the liteparse pipeline.
// These mock the sous-chef client to test the transcription → parse round-trip
// without making real API calls.

import { assertEquals } from "jsr:@std/assert"
import { parseRecipe } from '../parser/recipe-parser.ts'
import { LITEPARSE_SYSTEM_PROMPT } from './liteparse-prompt.ts'

// A realistic recipe markdown that the model might return from a photo.
const VALID_RECIPE_RESPONSE = `# Order Alert

> Notify the team when a big order comes in.

## Kitchen

- Shopify
- Gmail

## Steps

### 1. Listen for a new order

*Card: Listen*

- Listen for: new order above $500
- From: Shopify

### 2. Send an alert

*Card: Send Message*

- To: team@example.com
- Subject: Big order alert
- Message: A new order over $500 just came in!
`

// A garbled/partial response — model couldn't fully read the handwriting.
const PARTIAL_RESPONSE = `# My Recipe

## Steps

### 1. Do something [?]

*Card: Unknown*

- What: unclear handwriting
`

Deno.test("liteparse prompt: includes the recipe format specification", () => {
  // The prompt must teach the model the .recipe.md structure.
  assertEquals(LITEPARSE_SYSTEM_PROMPT.includes('## Kitchen'), true)
  assertEquals(LITEPARSE_SYSTEM_PROMPT.includes('## Steps'), true)
  assertEquals(LITEPARSE_SYSTEM_PROMPT.includes('*Card: Listen*'), true)
  assertEquals(LITEPARSE_SYSTEM_PROMPT.includes('*Card: Wait*'), true)
  assertEquals(LITEPARSE_SYSTEM_PROMPT.includes('*Card: Send Message*'), true)
})

Deno.test("liteparse prompt: instructs the model to mark illegible text with [?]", () => {
  assertEquals(LITEPARSE_SYSTEM_PROMPT.includes('[?]'), true)
})

Deno.test("liteparse round-trip: valid recipe markdown parses successfully", () => {
  const parsed = parseRecipe(VALID_RECIPE_RESPONSE)
  assertEquals(parsed.success, true)
  if (!parsed.success) return

  assertEquals(parsed.recipe.name, 'Order Alert')
  assertEquals(parsed.recipe.purpose, 'Notify the team when a big order comes in.')
  assertEquals(parsed.recipe.kitchen, ['Shopify', 'Gmail'])
  assertEquals(parsed.recipe.steps.length, 2)
})

Deno.test("liteparse round-trip: partial/garbled response produces parse errors", () => {
  const parsed = parseRecipe(PARTIAL_RESPONSE)
  // "Unknown" is not a valid card type, so this should fail.
  assertEquals(parsed.success, false)
  if (parsed.success) return

  assertEquals(parsed.errors.length > 0, true)
  // The error should mention "unknown card type"
  const hasCardError = parsed.errors.some(e => e.toLowerCase().includes('unknown card type'))
  assertEquals(hasCardError, true)
})

Deno.test("liteparse round-trip: recipe with all three card types parses correctly", () => {
  const markdown = `# Full Test

> Tests all card types.

## Kitchen

- Slack

## Steps

### 1. Wait for trigger

*Card: Listen*

- Listen for: new message
- From: Slack

### 2. Pause briefly

*Card: Wait*

- How long: 1 hour

### 3. Reply

*Card: Send Message*

- To: {step 1: sender}
- Message: Got it, thanks!
`
  const parsed = parseRecipe(markdown)
  assertEquals(parsed.success, true)
  if (!parsed.success) return

  assertEquals(parsed.recipe.steps.length, 3)
  const cards = parsed.recipe.steps.map(s => 'card' in s ? s.card : null)
  assertEquals(cards, ['listen', 'wait', 'send-message'])
})
