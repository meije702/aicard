import { assertEquals } from 'jsr:@std/assert'
import { parseWizardStepResponse } from './wizard-response-parser.ts'

Deno.test('parseWizardStepResponse: parses valid JSON', () => {
  const json = JSON.stringify({
    instruction: 'Enter your access token.',
    fields: [
      { key: 'token', type: 'password', label: 'Access token', placeholder: 'shpat_...', required: true },
    ],
    canAdvance: true,
  })
  const { response, errors } = parseWizardStepResponse(json)
  assertEquals(errors.length, 0)
  assertEquals(response.instruction, 'Enter your access token.')
  assertEquals(response.fields.length, 1)
  assertEquals(response.fields[0].type, 'password')
  assertEquals(response.fields[0].required, true)
  assertEquals(response.canAdvance, true)
})

Deno.test('parseWizardStepResponse: strips markdown fences', () => {
  const raw = '```json\n{"instruction": "Hello", "fields": [], "canAdvance": true}\n```'
  const { response, errors } = parseWizardStepResponse(raw)
  assertEquals(errors.length, 0)
  assertEquals(response.instruction, 'Hello')
})

Deno.test('parseWizardStepResponse: extracts JSON from surrounding text', () => {
  const raw = 'Here is the step:\n{"instruction": "Do this", "fields": [], "canAdvance": false}\nDone.'
  const { response, errors } = parseWizardStepResponse(raw)
  assertEquals(errors.length, 0)
  assertEquals(response.instruction, 'Do this')
  assertEquals(response.canAdvance, false)
})

Deno.test('parseWizardStepResponse: returns raw text as instruction on complete failure', () => {
  const raw = 'This is not JSON at all.'
  const { response, errors } = parseWizardStepResponse(raw)
  assertEquals(errors.length, 1)
  assertEquals(response.instruction, 'This is not JSON at all.')
  assertEquals(response.fields.length, 0)
})

Deno.test('parseWizardStepResponse: downgrades unknown field types to info', () => {
  const json = JSON.stringify({
    instruction: 'Test',
    fields: [{ key: 'x', type: 'slider', label: 'Volume' }],
    canAdvance: true,
  })
  const { response, errors } = parseWizardStepResponse(json)
  assertEquals(response.fields[0].type, 'info')
  assertEquals(errors.some(e => e.includes('slider')), true)
})

Deno.test('parseWizardStepResponse: skips fields missing key or label', () => {
  const json = JSON.stringify({
    instruction: 'Test',
    fields: [
      { key: '', type: 'text', label: 'Name' },
      { key: 'ok', type: 'text', label: 'Valid' },
    ],
    canAdvance: true,
  })
  const { response, errors } = parseWizardStepResponse(json)
  assertEquals(response.fields.length, 1)
  assertEquals(response.fields[0].key, 'ok')
  assertEquals(errors.length, 1)
})

Deno.test('parseWizardStepResponse: defaults canAdvance to true when missing', () => {
  const json = JSON.stringify({ instruction: 'Go ahead', fields: [] })
  const { response } = parseWizardStepResponse(json)
  assertEquals(response.canAdvance, true)
})

Deno.test('parseWizardStepResponse: parses select field with options', () => {
  const json = JSON.stringify({
    instruction: 'Pick one',
    fields: [{ key: 'scope', type: 'select', label: 'API scope', options: ['read_orders', 'write_orders'] }],
    canAdvance: true,
  })
  const { response, errors } = parseWizardStepResponse(json)
  assertEquals(errors.length, 0)
  assertEquals(response.fields[0].options?.length, 2)
})
