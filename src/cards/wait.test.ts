import { assertEquals } from 'jsr:@std/assert'
import { parseDurationToMs } from './wait.ts'
import { waitExecutor } from './wait.ts'
import type { Kitchen, RecipeContext } from '../types.ts'

// Duration parsing — direct unit tests via exported parseDurationToMs

Deno.test('parseDurationToMs: parses singular second', () => {
  assertEquals(parseDurationToMs('1 second'), 1000)
})

Deno.test('parseDurationToMs: parses plural days', () => {
  assertEquals(parseDurationToMs('3 days'), 3 * 24 * 60 * 60 * 1000)
})

Deno.test('parseDurationToMs: parses float hours', () => {
  assertEquals(parseDurationToMs('1.5 hours'), 1.5 * 60 * 60 * 1000)
})

Deno.test('parseDurationToMs: case insensitive', () => {
  assertEquals(parseDurationToMs('2 MINUTES'), 2 * 60 * 1000)
})

Deno.test('parseDurationToMs: empty string returns 0', () => {
  assertEquals(parseDurationToMs(''), 0)
})

Deno.test('parseDurationToMs: unknown unit returns 0', () => {
  assertEquals(parseDurationToMs('3 fortnights'), 0)
})

Deno.test('parseDurationToMs: negative value returns 0', () => {
  assertEquals(parseDurationToMs('-1 hours'), 0)
})

Deno.test('parseDurationToMs: zero seconds returns 0 (failure signal)', () => {
  assertEquals(parseDurationToMs('0 seconds'), 0)
})

// Execute — success and failure paths

Deno.test('waitExecutor: valid duration succeeds', async () => {
  const kitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }
  const context: RecipeContext = {}
  const result = await waitExecutor.execute({ 'how long': '1 second' }, context, kitchen)
  assertEquals(result.success, true)
  assertEquals(result.output.waited, '1 second')
})

Deno.test('waitExecutor: invalid duration fails with helpful message', async () => {
  const kitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }
  const context: RecipeContext = {}
  const result = await waitExecutor.execute({ 'how long': 'forever' }, context, kitchen)
  assertEquals(result.success, false)
  assertEquals(result.message?.includes('Try something like'), true)
})

// Equipment check

Deno.test('waitExecutor: checkEquipment always ready', () => {
  const kitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }
  const check = waitExecutor.checkEquipment(kitchen, {})
  assertEquals(check.ready, true)
  assertEquals(check.missing, [])
})

// Describe

Deno.test('waitExecutor: describe with config', () => {
  assertEquals(waitExecutor.describe({ 'how long': '3 days' }), 'Waiting 3 days...')
})

Deno.test('waitExecutor: describe without config', () => {
  assertEquals(waitExecutor.describe({}), 'Waiting some time...')
})
