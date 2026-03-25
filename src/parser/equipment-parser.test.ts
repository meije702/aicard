import { assertEquals, assertExists, assertGreater } from 'jsr:@std/assert'
import { parseEquipmentDefinition } from './equipment-parser.ts'
import type { EquipmentDefinition } from '../types.ts'

const shopifyMd = Deno.readTextFileSync(
  new URL('../fixtures/equipment/shopify.equipment.md', import.meta.url)
)

const gmailMd = Deno.readTextFileSync(
  new URL('../fixtures/equipment/gmail.equipment.md', import.meta.url)
)

// Helper: assert success and unwrap the equipment definition, or throw.
function expectSuccess(markdown: string): EquipmentDefinition {
  const parsed = parseEquipmentDefinition(markdown)
  if (!parsed.success) {
    throw new Error(`Expected parsing to succeed, but got errors: ${parsed.errors.join('; ')}`)
  }
  return parsed.equipment
}

// --- Shopify fixture ---

Deno.test('parseEquipmentDefinition: parses Shopify name and purpose', () => {
  const def = expectSuccess(shopifyMd)
  assertEquals(def.name, 'Shopify')
  assertEquals(def.purpose.includes('Shopify store'), true)
})

Deno.test('parseEquipmentDefinition: parses Shopify mode as api-key', () => {
  const def = expectSuccess(shopifyMd)
  assertEquals(def.mode, 'api-key')
})

Deno.test('parseEquipmentDefinition: parses Shopify documentation links', () => {
  const def = expectSuccess(shopifyMd)
  assertEquals(def.documentation.length, 2)
  assertEquals(def.documentation[0].label, 'Setup guide')
  assertEquals(def.documentation[0].url.includes('shopify.dev'), true)
})

Deno.test('parseEquipmentDefinition: parses Shopify steps', () => {
  const def = expectSuccess(shopifyMd)
  assertEquals(def.steps.length, 3)
  assertEquals(def.steps[0].number, 1)
  assertEquals(def.steps[0].title, 'Create a development app')
  assertEquals(def.steps[0].instructions.includes('Shopify admin'), true)
  assertEquals(def.steps[2].number, 3)
  assertEquals(def.steps[2].title, 'Install and copy token')
})

Deno.test('parseEquipmentDefinition: parses Shopify config fields with validation', () => {
  const def = expectSuccess(shopifyMd)
  assertEquals(def.configFields.length, 1)
  assertEquals(def.configFields[0].name, 'Access token')
  assertEquals(def.configFields[0].validate, 'starts-with shpat_')
})

Deno.test('parseEquipmentDefinition: parses Shopify technique', () => {
  const def = expectSuccess(shopifyMd)
  assertExists(def.technique)
  assertEquals(def.technique.voice.includes('patient'), true)
  assertEquals(def.technique.constraints.includes('one step at a time'), true)
  assertEquals(def.technique.expertise.includes('shpat_'), true)
})

// --- Gmail fixture ---

Deno.test('parseEquipmentDefinition: parses Gmail as compose mode', () => {
  const def = expectSuccess(gmailMd)
  assertEquals(def.name, 'Gmail')
  assertEquals(def.mode, 'compose')
})

Deno.test('parseEquipmentDefinition: Gmail has one step', () => {
  const def = expectSuccess(gmailMd)
  assertEquals(def.steps.length, 1)
  assertEquals(def.steps[0].title, 'Confirm compose mode')
})

Deno.test('parseEquipmentDefinition: Gmail has no config fields', () => {
  const def = expectSuccess(gmailMd)
  assertEquals(def.configFields.length, 0)
})

Deno.test('parseEquipmentDefinition: Gmail has a technique', () => {
  const def = expectSuccess(gmailMd)
  assertExists(def.technique)
  assertEquals(def.technique.voice.includes('full control'), true)
})

// --- Edge cases ---

Deno.test('parseEquipmentDefinition: missing mode defaults to api-key', () => {
  const def = expectSuccess('# Test\n\n> A test.\n\n## Steps\n\n### 1. Do something\nDo it.')
  assertEquals(def.mode, 'api-key')
})

Deno.test('parseEquipmentDefinition: missing steps produces error', () => {
  const result = parseEquipmentDefinition('# Test\n\n> A test.')
  assertEquals(result.success, false)
  if (!result.success) {
    assertGreater(result.errors.length, 0)
    assertEquals(result.errors[0].includes('Steps'), true)
  }
})

Deno.test('parseEquipmentDefinition: missing title produces error', () => {
  const result = parseEquipmentDefinition('No heading here')
  assertEquals(result.success, false)
  if (!result.success) {
    assertEquals(result.errors.some(e => e.includes('title')), true)
  }
})

Deno.test('parseEquipmentDefinition: technique is undefined when section absent', () => {
  const def = expectSuccess('# Test\n\n> A test.\n\n## Steps\n\n### 1. Step\nDo it.')
  assertEquals(def.technique, undefined)
})
