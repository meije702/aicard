import { assertEquals, assertGreater } from "jsr:@std/assert"
import { parseCard } from './card-parser.ts'

const listenFixture = await Deno.readTextFile(
  new URL('../fixtures/pantry/listen.card.md', import.meta.url)
)
const waitFixture = await Deno.readTextFile(
  new URL('../fixtures/pantry/wait.card.md', import.meta.url)
)
const sendMessageFixture = await Deno.readTextFile(
  new URL('../fixtures/pantry/send-message.card.md', import.meta.url)
)

// ---------------------------------------------------------------------------
// listen fixture
// ---------------------------------------------------------------------------

Deno.test("parseCard: parses the card name and normalises to a type", () => {
  const card = parseCard(listenFixture)
  assertEquals(card.name, 'Listen')
  assertEquals(card.type, 'listen')
})

Deno.test("parseCard: parses the card purpose", () => {
  const card = parseCard(listenFixture)
  assertEquals(card.purpose.includes('Watches for something to happen'), true)
})

Deno.test("parseCard: parses config fields", () => {
  const card = parseCard(listenFixture)
  const fieldNames = card.configFields.map(f => f.name)
  assertEquals(fieldNames.includes('listen for'), true)
  assertEquals(fieldNames.includes('from'), true)
})

Deno.test("parseCard: parses equipment requirements", () => {
  const card = parseCard(listenFixture)
  assertGreater(card.equipment.length, 0)
  assertEquals(card.equipment[0].required, true)
})

// ---------------------------------------------------------------------------
// wait fixture
// ---------------------------------------------------------------------------

Deno.test("parseCard: parses wait card type", () => {
  const card = parseCard(waitFixture)
  assertEquals(card.type, 'wait')
})

Deno.test("parseCard: parses how-long config field", () => {
  const card = parseCard(waitFixture)
  const fieldNames = card.configFields.map(f => f.name)
  assertEquals(fieldNames.includes('how long'), true)
})

Deno.test("parseCard: wait card returns no equipment requirements", () => {
  const card = parseCard(waitFixture)
  assertEquals(card.equipment.length, 0)
})

// ---------------------------------------------------------------------------
// send-message fixture
// ---------------------------------------------------------------------------

Deno.test("parseCard: normalises send-message type", () => {
  const card = parseCard(sendMessageFixture)
  assertEquals(card.type, 'send-message')
})

Deno.test("parseCard: parses to, subject, and message config fields", () => {
  const card = parseCard(sendMessageFixture)
  const fieldNames = card.configFields.map(f => f.name)
  assertEquals(fieldNames.includes('to'), true)
  assertEquals(fieldNames.includes('subject'), true)
  assertEquals(fieldNames.includes('message'), true)
})
