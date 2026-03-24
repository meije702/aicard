// Parse the sous chef's JSON response into a WizardStepResponse.
// Uses the same fence-stripping + fallback pattern as extractOptions() in sous-chef.ts.

import type { WizardStepResponse, WizardFieldSpec, WizardFieldType } from '../types.ts'

const KNOWN_FIELD_TYPES: Set<string> = new Set(['text', 'password', 'select', 'info', 'confirm'])

export function parseWizardStepResponse(raw: string): { response: WizardStepResponse; errors: string[] } {
  const errors: string[] = []

  // Tier 1: strip markdown fences and try direct parse
  const cleaned = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  let parsed = tryParse(cleaned)

  // Tier 2: extract first {...} block and try that
  if (!parsed) {
    const match = cleaned.match(/\{[\s\S]*\}/)
    if (match) parsed = tryParse(match[0])
  }

  // Tier 3: complete failure
  if (!parsed) {
    errors.push('Could not parse sous chef response as JSON.')
    return {
      response: { instruction: raw.trim(), fields: [], canAdvance: true },
      errors,
    }
  }

  // Validate the parsed object
  const response = validateResponse(parsed, errors)
  return { response, errors }
}

function tryParse(text: string): Record<string, unknown> | null {
  try {
    const result = JSON.parse(text)
    if (typeof result === 'object' && result !== null) return result as Record<string, unknown>
  } catch { /* continue */ }
  return null
}

function validateResponse(raw: Record<string, unknown>, errors: string[]): WizardStepResponse {
  const instruction = typeof raw.instruction === 'string' && raw.instruction.trim()
    ? raw.instruction.trim()
    : (errors.push('Response missing "instruction" field.'), '')

  const canAdvance = typeof raw.canAdvance === 'boolean' ? raw.canAdvance : true

  const fields: WizardFieldSpec[] = []
  if (Array.isArray(raw.fields)) {
    for (const item of raw.fields) {
      if (typeof item !== 'object' || item === null) continue
      const f = item as Record<string, unknown>

      const key = typeof f.key === 'string' ? f.key : ''
      const label = typeof f.label === 'string' ? f.label : ''
      let type = typeof f.type === 'string' ? f.type : 'text'

      if (!key || !label) {
        errors.push(`Field missing required "key" or "label": ${JSON.stringify(f)}`)
        continue
      }

      // Downgrade unknown types to 'info' with a warning
      if (!KNOWN_FIELD_TYPES.has(type)) {
        errors.push(`Unknown field type "${type}" — downgrading to "info".`)
        type = 'info'
      }

      fields.push({
        key,
        type: type as WizardFieldType,
        label,
        placeholder: typeof f.placeholder === 'string' ? f.placeholder : undefined,
        defaultValue: typeof f.defaultValue === 'string' ? f.defaultValue : undefined,
        options: Array.isArray(f.options) ? f.options.filter((o): o is string => typeof o === 'string') : undefined,
        required: typeof f.required === 'boolean' ? f.required : undefined,
      })
    }
  }

  return { instruction, fields, canAdvance }
}
