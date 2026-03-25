import { assertEquals } from 'jsr:@std/assert'
import { buildTourStopList, buildFallbackTourStops } from './tour-prompts.ts'
import type { Recipe, Kitchen } from '../types.ts'

function makeRecipe(overrides?: Partial<Recipe>): Recipe {
  return {
    name: 'Thank You Follow-Up',
    purpose: 'Send a personalised thank you message.',
    kitchen: ['Shopify', 'Gmail'],
    steps: [
      { number: 1, name: 'Listen for a new order', card: 'listen', config: { 'listen for': 'new order', 'from': 'Shopify' } },
      { number: 2, name: 'Wait a few days', card: 'wait', config: { 'how long': '3 days' } },
      { number: 3, name: 'Send the thank you message', card: 'send-message', config: { 'to': '{step 1: customer email}', 'subject': 'Thank you for your order', 'message': 'We appreciate your support.' } },
    ],
    errors: [],
    ...overrides,
  }
}

function makeKitchen(connected: string[] = []): Kitchen {
  return {
    equipment: connected.map(name => ({ name, type: name.toLowerCase(), connected: true, config: {} })),
    recipes: [],
    pantry: [],
    journal: [],
  }
}

// --- buildTourStopList ---

Deno.test('buildTourStopList: includes header, equipment, all steps, and run area', () => {
  const stops = buildTourStopList(makeRecipe())
  assertEquals(stops.length, 6) // header + equipment + 3 steps + run-area
  assertEquals(stops[0].stopType, 'header')
  assertEquals(stops[1].stopType, 'equipment')
  assertEquals(stops[2].stopType, 'step')
  assertEquals(stops[2].stepIndex, 0)
  assertEquals(stops[3].stepIndex, 1)
  assertEquals(stops[4].stepIndex, 2)
  assertEquals(stops[5].stopType, 'run-area')
})

Deno.test('buildTourStopList: skips equipment when kitchen is empty', () => {
  const stops = buildTourStopList(makeRecipe({ kitchen: [] }))
  assertEquals(stops[0].stopType, 'header')
  assertEquals(stops[1].stopType, 'step') // no equipment stop
})

// --- buildFallbackTourStops: Listen card uses real config keys ---

Deno.test('buildFallbackTourStops: Listen card describes listen-for and from', () => {
  const stops = buildFallbackTourStops(makeRecipe(), makeKitchen())
  const listenStop = stops.find(s => s.title.includes('Listen'))!
  assertEquals(listenStop.body.includes('new order'), true, `Expected "new order" in: ${listenStop.body}`)
  assertEquals(listenStop.body.includes('Shopify'), true, `Expected "Shopify" in: ${listenStop.body}`)
})

Deno.test('buildFallbackTourStops: Listen card with only listen-for (no from)', () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Listen', card: 'listen', config: { 'listen for': 'new signup' } },
    ],
  })
  const stops = buildFallbackTourStops(recipe, makeKitchen())
  const listenStop = stops.find(s => s.title.includes('Listen'))!
  assertEquals(listenStop.body.includes('new signup'), true)
})

Deno.test('buildFallbackTourStops: Listen card with empty config falls back gracefully', () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Listen', card: 'listen', config: {} },
    ],
  })
  const stops = buildFallbackTourStops(recipe, makeKitchen())
  const listenStop = stops.find(s => s.title.includes('Listen'))!
  assertEquals(listenStop.body.includes('waits for something'), true)
})

// --- buildFallbackTourStops: Wait card uses real config keys ---

Deno.test('buildFallbackTourStops: Wait card describes how-long duration', () => {
  const stops = buildFallbackTourStops(makeRecipe(), makeKitchen())
  const waitStop = stops.find(s => s.title.includes('Wait'))!
  assertEquals(waitStop.body.includes('3 days'), true, `Expected "3 days" in: ${waitStop.body}`)
  assertEquals(waitStop.body.includes('Keep the tab open'), true)
})

Deno.test('buildFallbackTourStops: Wait card with empty config falls back gracefully', () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Wait', card: 'wait', config: {} },
    ],
  })
  const stops = buildFallbackTourStops(recipe, makeKitchen())
  const waitStop = stops.find(s => s.title.includes('Wait'))!
  assertEquals(waitStop.body.includes('pauses for a set time'), true)
})

// --- buildFallbackTourStops: Send Message card uses real config keys ---

Deno.test('buildFallbackTourStops: Send Message card describes to and subject', () => {
  const stops = buildFallbackTourStops(makeRecipe(), makeKitchen())
  const sendStop = stops.find(s => s.title.includes('Send'))!
  assertEquals(sendStop.body.includes('{step 1: customer email}'), true, `Expected recipient in: ${sendStop.body}`)
  assertEquals(sendStop.body.includes('Thank you for your order'), true, `Expected subject in: ${sendStop.body}`)
})

Deno.test('buildFallbackTourStops: Send Message with only to (no subject)', () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Send note', card: 'send-message', config: { 'to': 'user@example.com' } },
    ],
  })
  const stops = buildFallbackTourStops(recipe, makeKitchen())
  const sendStop = stops.find(s => s.title.includes('Send'))!
  assertEquals(sendStop.body.includes('user@example.com'), true)
})

Deno.test('buildFallbackTourStops: Send Message with empty config falls back gracefully', () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Send', card: 'send-message', config: {} },
    ],
  })
  const stops = buildFallbackTourStops(recipe, makeKitchen())
  const sendStop = stops.find(s => s.title.includes('Send'))!
  assertEquals(sendStop.body.includes('composes and sends'), true)
})

// --- buildFallbackTourStops: equipment and run-area ---

Deno.test('buildFallbackTourStops: equipment stop shows connected status', () => {
  const stops = buildFallbackTourStops(makeRecipe(), makeKitchen(['Shopify']))
  const eqStop = stops.find(s => s.title === 'Equipment needed')!
  assertEquals(eqStop.body.includes('Shopify'), true)
  assertEquals(eqStop.body.includes('Connected ✓'), true)
  assertEquals(eqStop.body.includes('Not connected yet'), true) // Gmail
})

Deno.test('buildFallbackTourStops: run-area says ready when all equipment connected', () => {
  const stops = buildFallbackTourStops(makeRecipe(), makeKitchen(['Shopify', 'Gmail']))
  const runStop = stops.find(s => s.targetSelector === 'run-area')!
  assertEquals(runStop.body.includes('Run recipe'), true)
})

Deno.test('buildFallbackTourStops: run-area says missing when equipment not connected', () => {
  const stops = buildFallbackTourStops(makeRecipe(), makeKitchen())
  const runStop = stops.find(s => s.targetSelector === 'run-area')!
  assertEquals(runStop.body.includes('Connect'), true)
})
