import { assertEquals, assertGreater } from "jsr:@std/assert"
import { parseCard } from './card-parser.ts'
import type { CardDefinition } from '../types.ts'

const listenFixture = await Deno.readTextFile(
  new URL('../fixtures/pantry/listen.card.md', import.meta.url)
)
const waitFixture = await Deno.readTextFile(
  new URL('../fixtures/pantry/wait.card.md', import.meta.url)
)
const sendMessageFixture = await Deno.readTextFile(
  new URL('../fixtures/pantry/send-message.card.md', import.meta.url)
)

// Helper: assert success and unwrap the card definition, or throw.
function expectSuccess(markdown: string): CardDefinition {
  const parsed = parseCard(markdown)
  if (!parsed.success) {
    throw new Error(`Expected parsing to succeed, but got errors: ${parsed.errors.join('; ')}`)
  }
  return parsed.card
}

// ---------------------------------------------------------------------------
// listen fixture
// ---------------------------------------------------------------------------

Deno.test("parseCard: parses the card name and normalises to a type", () => {
  const card = expectSuccess(listenFixture)
  assertEquals(card.name, 'Listen')
  assertEquals(card.type, 'listen')
})

Deno.test("parseCard: parses the card purpose", () => {
  const card = expectSuccess(listenFixture)
  assertEquals(card.purpose.includes('Watches for something to happen'), true)
})

Deno.test("parseCard: parses config fields", () => {
  const card = expectSuccess(listenFixture)
  const fieldNames = card.configFields.map(f => f.name)
  assertEquals(fieldNames.includes('listen for'), true)
  assertEquals(fieldNames.includes('from'), true)
})

Deno.test("parseCard: parses equipment requirements", () => {
  const card = expectSuccess(listenFixture)
  assertGreater(card.equipment.length, 0)
  assertEquals(card.equipment[0].required, true)
})

// ---------------------------------------------------------------------------
// wait fixture
// ---------------------------------------------------------------------------

Deno.test("parseCard: parses wait card type", () => {
  const card = expectSuccess(waitFixture)
  assertEquals(card.type, 'wait')
})

Deno.test("parseCard: parses how-long config field", () => {
  const card = expectSuccess(waitFixture)
  const fieldNames = card.configFields.map(f => f.name)
  assertEquals(fieldNames.includes('how long'), true)
})

Deno.test("parseCard: wait card returns no equipment requirements", () => {
  const card = expectSuccess(waitFixture)
  assertEquals(card.equipment.length, 0)
})

// ---------------------------------------------------------------------------
// send-message fixture
// ---------------------------------------------------------------------------

Deno.test("parseCard: normalises send-message type", () => {
  const card = expectSuccess(sendMessageFixture)
  assertEquals(card.type, 'send-message')
})

Deno.test("parseCard: parses to, subject, and message config fields", () => {
  const card = expectSuccess(sendMessageFixture)
  const fieldNames = card.configFields.map(f => f.name)
  assertEquals(fieldNames.includes('to'), true)
  assertEquals(fieldNames.includes('subject'), true)
  assertEquals(fieldNames.includes('message'), true)
})

// ---------------------------------------------------------------------------
// error cases
// ---------------------------------------------------------------------------

Deno.test("parseCard: returns error for unknown card type", () => {
  const result = parseCard('# Make Coffee\n\n> Brews a cup of coffee.')
  assertEquals(result.success, false)
  if (!result.success) {
    assertGreater(result.errors.length, 0)
    assertEquals(result.errors.some(e => e.includes('Make Coffee')), true)
  }
})

Deno.test("parseCard: returns error for missing title", () => {
  const result = parseCard('No heading here, just text.')
  assertEquals(result.success, false)
  if (!result.success) {
    assertEquals(result.errors.some(e => e.includes('title')), true)
  }
})

Deno.test("parseCard: empty document produces only missing-title error", () => {
  // Empty document — no heading, so name is '' and type is null.
  // Unknown type error does NOT fire when name is empty (nothing to validate).
  const result = parseCard('')
  assertEquals(result.success, false)
  if (!result.success) {
    assertEquals(result.errors.some(e => e.includes('title')), true)
    assertEquals(result.errors.length, 1)
  }
})
