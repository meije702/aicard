// Tests for the Send Message card executor.
// Covers mailto: URL construction, compose-and-hand-off mode,
// and headless fallback.

import { assertEquals } from 'jsr:@std/assert'
import { sendMessageExecutor, buildMailtoUrl } from './send-message.ts'
import type { Kitchen, RecipeContext } from '../types.ts'

const connectedKitchen: Kitchen = {
  equipment: [
    { name: 'Gmail', type: 'gmail', connected: true, config: { mode: 'compose' } },
  ],
  recipes: [],
  pantry: [],
}

const emptyContext: RecipeContext = {}

Deno.test('buildMailtoUrl: constructs correct URL with to, subject, and body', () => {
  const url = buildMailtoUrl('maria@shop.com', 'Thank you', 'We appreciate your order!')

  assertEquals(url.startsWith('mailto:'), true)
  assertEquals(url.includes('subject='), true)
  assertEquals(url.includes('body='), true)
  assertEquals(url.includes(encodeURIComponent('maria@shop.com')), true)
})

Deno.test('buildMailtoUrl: handles empty subject and body', () => {
  const url = buildMailtoUrl('test@example.com', '', '')

  assertEquals(url, `mailto:${encodeURIComponent('test@example.com')}`)
})

Deno.test('sendMessageExecutor: with no to config, returns failure', async () => {
  const config = { 'subject': 'Hello', 'message': 'Hi there' }

  const result = await sendMessageExecutor.execute(config, emptyContext, connectedKitchen)

  assertEquals(result.success, false)
})

Deno.test('sendMessageExecutor: result message says opened not sent', async () => {
  const config = { 'to': 'maria@shop.com', 'subject': 'Thanks', 'message': 'Thank you!' }

  const result = await sendMessageExecutor.execute(config, emptyContext, connectedKitchen)

  assertEquals(result.success, true)
  assertEquals(result.message.includes('Opened'), true)
  assertEquals(result.message.includes('sent') || result.message.includes('Sent'), false)
})

Deno.test('sendMessageExecutor: without onInteraction, returns success with composed data', async () => {
  const config = { 'to': 'maria@shop.com', 'subject': 'Thanks', 'message': 'Thank you!' }

  const result = await sendMessageExecutor.execute(config, emptyContext, connectedKitchen)

  assertEquals(result.success, true)
  assertEquals(result.output['to'], 'maria@shop.com')
  assertEquals(result.output['subject'], 'Thanks')
})

Deno.test('sendMessageExecutor: with onInteraction, shows composed message for review', async () => {
  const config = { 'to': 'maria@shop.com', 'subject': 'Thanks', 'message': 'Thank you!' }
  let receivedFields: string[] = []

  // Mock globalThis.open to prevent actual mailto: opening in tests
  const originalOpen = globalThis.open
  globalThis.open = (() => null) as typeof globalThis.open

  try {
    const result = await sendMessageExecutor.execute(
      config, emptyContext, connectedKitchen,
      async (interaction) => {
        receivedFields = interaction.fields.map(f => f.key)
        return {}
      }
    )

    assertEquals(result.success, true)
    assertEquals(receivedFields.includes('to'), true)
    assertEquals(receivedFields.includes('subject'), true)
    assertEquals(receivedFields.includes('message'), true)
  } finally {
    globalThis.open = originalOpen
  }
})

Deno.test('sendMessageExecutor: checkEquipment passes with connected service', () => {
  const check = sendMessageExecutor.checkEquipment(connectedKitchen, {})

  assertEquals(check.ready, true)
})

Deno.test('sendMessageExecutor: checkEquipment fails with no connected services', () => {
  const emptyKitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }
  const check = sendMessageExecutor.checkEquipment(emptyKitchen, {})

  assertEquals(check.ready, false)
})

Deno.test('sendMessageExecutor: describe returns plain-English description', () => {
  const config = { 'to': 'maria@shop.com' }
  const description = sendMessageExecutor.describe(config)

  assertEquals(description, 'Sending a message to maria@shop.com...')
})
