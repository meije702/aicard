import { assertEquals } from 'jsr:@std/assert'
import { buildEquipmentStepPrompt, buildFallbackStepResponse } from './equipment-prompts.ts'
import type { EquipmentDefinition } from '../types.ts'

function makeShopifyDef(): EquipmentDefinition {
  return {
    name: 'Shopify',
    purpose: 'Connect your Shopify store.',
    mode: 'api-key',
    documentation: [
      { label: 'Setup guide', url: 'https://shopify.dev/docs/setup' },
    ],
    steps: [
      { number: 1, title: 'Create app', instructions: 'Go to Settings → Apps.' },
      { number: 2, title: 'Configure API', instructions: 'Enable scopes.' },
      { number: 3, title: 'Copy token', instructions: 'Install and copy.' },
    ],
    configFields: [
      { name: 'Access token', description: 'the API access token', validate: 'starts-with shpat_' },
    ],
    technique: {
      voice: 'Patient and encouraging.',
      constraints: 'One step at a time.',
      expertise: 'Shopify admin expert.',
    },
  }
}

// --- buildEquipmentStepPrompt ---

Deno.test('buildEquipmentStepPrompt: includes technique', () => {
  const result = buildEquipmentStepPrompt(makeShopifyDef(), 1, {})
  assertEquals(result.includes('## Technique'), true)
  assertEquals(result.includes('Patient and encouraging.'), true)
})

Deno.test('buildEquipmentStepPrompt: includes current step', () => {
  const result = buildEquipmentStepPrompt(makeShopifyDef(), 2, {})
  assertEquals(result.includes('step (2 of 3)'), true)
  assertEquals(result.includes('Configure API'), true)
  assertEquals(result.includes('Enable scopes.'), true)
})

Deno.test('buildEquipmentStepPrompt: includes config fields still needed', () => {
  const result = buildEquipmentStepPrompt(makeShopifyDef(), 3, {})
  assertEquals(result.includes('Config fields still needed'), true)
  assertEquals(result.includes('Access token'), true)
  assertEquals(result.includes('starts-with shpat_'), true)
})

Deno.test('buildEquipmentStepPrompt: omits collected config from needed list', () => {
  const result = buildEquipmentStepPrompt(makeShopifyDef(), 3, { 'Access token': 'shpat_xxx' })
  assertEquals(result.includes('Config fields still needed'), false)
  assertEquals(result.includes('Config collected so far'), true)
})

Deno.test('buildEquipmentStepPrompt: includes documentation references', () => {
  const result = buildEquipmentStepPrompt(makeShopifyDef(), 1, {})
  assertEquals(result.includes('Documentation references'), true)
  assertEquals(result.includes('https://shopify.dev/docs/setup'), true)
})

Deno.test('buildEquipmentStepPrompt: includes JSON response format', () => {
  const result = buildEquipmentStepPrompt(makeShopifyDef(), 1, {})
  assertEquals(result.includes('Response format'), true)
  assertEquals(result.includes('"instruction"'), true)
})

// --- buildFallbackStepResponse ---

Deno.test('buildFallbackStepResponse: returns step instructions', () => {
  const response = buildFallbackStepResponse(makeShopifyDef(), 1)
  assertEquals(response.instruction, 'Go to Settings → Apps.')
  assertEquals(response.fields.length, 0)
  assertEquals(response.canAdvance, true)
})

Deno.test('buildFallbackStepResponse: includes config fields on last step', () => {
  const response = buildFallbackStepResponse(makeShopifyDef(), 3)
  assertEquals(response.instruction, 'Install and copy.')
  assertEquals(response.fields.length, 1)
  assertEquals(response.fields[0].type, 'password')
  assertEquals(response.fields[0].label, 'Access token')
  assertEquals(response.fields[0].placeholder, 'shpat_...')
})

Deno.test('buildFallbackStepResponse: handles missing step gracefully', () => {
  const response = buildFallbackStepResponse(makeShopifyDef(), 99)
  assertEquals(response.instruction.includes('could not be loaded'), true)
  assertEquals(response.fields.length, 0)
})
