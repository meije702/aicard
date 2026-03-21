// Tests for the Listen card executor.
// Covers both manual confirmation mode (with onInteraction) and
// headless/test fallback mode (without onInteraction).

import { assertEquals, assertExists } from 'jsr:@std/assert'
import { listenExecutor } from './listen.ts'
import type { Kitchen, RecipeContext } from '../types.ts'

const connectedKitchen: Kitchen = {
  equipment: [
    { name: 'Shopify', type: 'shopify', connected: true, config: { apiKey: 'shpat_test' } },
  ],
  recipes: [],
  pantry: [],
}

const emptyContext: RecipeContext = {}

Deno.test('listenExecutor: with onInteraction, calls confirm and returns user data', async () => {
  const config = { 'listen for': 'new order', 'from': 'Shopify' }

  const result = await listenExecutor.execute(config, emptyContext, connectedKitchen, async (interaction) => {
    // Verify the interaction has the right fields for a "new order" event
    assertExists(interaction.fields.find(f => f.key === 'customer email'))
    assertExists(interaction.fields.find(f => f.key === 'order number'))
    return { 'customer email': 'maria@shop.com', 'order number': '#1042' }
  })

  assertEquals(result.success, true)
  assertEquals(result.output['customer email'], 'maria@shop.com')
  assertEquals(result.output['order number'], '#1042')
  assertEquals(result.output['event'], 'new order')
  assertEquals(result.output['source'], 'Shopify')
})

Deno.test('listenExecutor: without onInteraction, returns placeholder data (backward compat)', async () => {
  const config = { 'listen for': 'new order', 'from': 'Shopify' }

  const result = await listenExecutor.execute(config, emptyContext, connectedKitchen)

  assertEquals(result.success, true)
  assertEquals(result.output['customer email'], 'customer@example.com')
  assertEquals(result.output['event'], 'new order')
})

Deno.test('listenExecutor: fails when equipment is not connected', async () => {
  const disconnectedKitchen: Kitchen = {
    equipment: [
      { name: 'Shopify', type: 'shopify', connected: false, config: {} },
    ],
    recipes: [],
    pantry: [],
  }
  const config = { 'listen for': 'new order', 'from': 'Shopify' }

  const result = await listenExecutor.execute(config, emptyContext, disconnectedKitchen)

  assertEquals(result.success, false)
})

Deno.test('listenExecutor: checkEquipment passes when named equipment is connected', () => {
  const config = { 'listen for': 'new order', 'from': 'Shopify' }
  const check = listenExecutor.checkEquipment(connectedKitchen, config)

  assertEquals(check.ready, true)
  assertEquals(check.missing.length, 0)
})

Deno.test('listenExecutor: checkEquipment fails when named equipment is missing', () => {
  const emptyKitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }
  const config = { 'listen for': 'new order', 'from': 'Shopify' }
  const check = listenExecutor.checkEquipment(emptyKitchen, config)

  assertEquals(check.ready, false)
  assertEquals(check.missing, ['Shopify'])
})

Deno.test('listenExecutor: describe returns plain-English description', () => {
  const config = { 'listen for': 'new order', 'from': 'Shopify' }
  const description = listenExecutor.describe(config)

  assertEquals(description, 'Listening for a new order from Shopify...')
})

Deno.test('listenExecutor: interaction fields vary by event type', async () => {
  const config = { 'listen for': 'new subscriber', 'from': 'Shopify' }
  let fieldKeys: string[] = []

  await listenExecutor.execute(config, emptyContext, connectedKitchen, async (interaction) => {
    fieldKeys = interaction.fields.map(f => f.key)
    return { 'subscriber email': 'test@example.com', 'subscriber name': 'Test' }
  })

  assertEquals(fieldKeys.includes('subscriber email'), true)
  assertEquals(fieldKeys.includes('subscriber name'), true)
})
