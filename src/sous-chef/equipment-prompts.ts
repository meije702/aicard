// Prompt assembly for sous chef-guided equipment setup.
// Follows the same section-based pattern as prompts.ts.

import type { EquipmentDefinition, WizardStepResponse } from '../types.ts'

// Build the user message for a specific wizard step.
// The sous chef receives this + the equipment system prompt suffix.
export function buildEquipmentStepPrompt(
  equipmentDef: EquipmentDefinition,
  stepNumber: number,
  collectedConfig: Record<string, string>,
): string {
  const sections: string[] = []

  // 1. Technique (voice, constraints, expertise)
  if (equipmentDef.technique) {
    const t = equipmentDef.technique
    const techParts: string[] = []
    if (t.voice) techParts.push(`### Voice\n${t.voice}`)
    if (t.constraints) techParts.push(`### Constraints\n${t.constraints}`)
    if (t.expertise) techParts.push(`### Expertise\n${t.expertise}`)
    if (techParts.length > 0) {
      sections.push(`## Technique\n\n${techParts.join('\n\n')}`)
    }
  }

  // 2. Equipment identity and purpose
  sections.push(
    `## Equipment: ${equipmentDef.name}\n\n` +
    `Purpose: ${equipmentDef.purpose}\n` +
    `Connection mode: ${equipmentDef.mode}`
  )

  // 3. Current step instructions (from the .equipment.md)
  const step = equipmentDef.steps.find(s => s.number === stepNumber)
  if (step) {
    sections.push(
      `## Current step (${stepNumber} of ${equipmentDef.steps.length})\n\n` +
      `Title: ${step.title}\n\n` +
      `Instructions from the equipment guide:\n${step.instructions}`
    )
  }

  // 4. Config collected so far
  const collectedEntries = Object.entries(collectedConfig)
  if (collectedEntries.length > 0) {
    const lines = collectedEntries.map(([k]) => `  ${k}: (provided)`).join('\n')
    sections.push(`## Config collected so far\n\n${lines}`)
  }

  // 5. Config fields still needed
  const needed = equipmentDef.configFields.filter(
    f => !collectedConfig[f.name] && f.name.toLowerCase() !== 'none'
  )
  if (needed.length > 0) {
    const lines = needed.map(f => {
      let line = `  ${f.name}: ${f.description}`
      if (f.validate) line += ` (validation: ${f.validate})`
      return line
    }).join('\n')
    sections.push(`## Config fields still needed\n\n${lines}`)
  }

  // 6. Documentation references
  if (equipmentDef.documentation.length > 0) {
    const lines = equipmentDef.documentation.map(d => `- ${d.label}: ${d.url}`).join('\n')
    sections.push(`## Documentation references\n\n${lines}`)
  }

  // 7. Response format instruction
  sections.push(
    `## Response format\n\n` +
    `Respond with ONLY a JSON object in this exact format, no other text:\n` +
    `{"instruction": "what to tell the user for this step", "fields": [{"key": "field_key", "type": "text|password|select|info|confirm", "label": "Field label", "placeholder": "optional", "required": true}], "canAdvance": true}\n\n` +
    `Field types: "text" for general input, "password" for tokens/keys, "select" for choices, "info" for read-only guidance, "confirm" for a confirmation button.\n` +
    `Only include fields that the user needs to fill in during THIS step. Steps that are just instructions should have an empty fields array.`
  )

  return sections.join('\n\n---\n\n')
}

// System prompt suffix for equipment setup (appended to the base SOUS_CHEF_SYSTEM_PROMPT)
export const EQUIPMENT_SETUP_SYSTEM_SUFFIX =
  'You are now guiding the user through connecting a piece of equipment to their kitchen. ' +
  'Present one step at a time. Be patient and encouraging — the user may not be technical. ' +
  'Use recipe language, never technical jargon. ' +
  'If a step requires the user to enter a token or key, include a password field in your response. ' +
  'If a step is informational, use an empty fields array.'

// Build a WizardStepResponse directly from the .equipment.md data.
// Used as a fallback when the sous chef is unavailable or returns bad JSON.
export function buildFallbackStepResponse(
  equipmentDef: EquipmentDefinition,
  stepNumber: number,
): WizardStepResponse {
  const step = equipmentDef.steps.find(s => s.number === stepNumber)
  if (!step) {
    return { instruction: 'This step could not be loaded.', fields: [], canAdvance: true }
  }

  // Determine if this is the last step and config fields should be shown
  const isLastStep = stepNumber === equipmentDef.steps.length
  const fields = isLastStep
    ? equipmentDef.configFields.map(f => ({
        key: f.name.toLowerCase().replace(/\s+/g, '_'),
        type: (f.validate?.includes('shpat_') || f.name.toLowerCase().includes('token') || f.name.toLowerCase().includes('key')
          ? 'password' : 'text') as 'password' | 'text',
        label: f.name,
        placeholder: f.validate?.startsWith('starts-with ')
          ? f.validate.replace('starts-with ', '') + '...'
          : undefined,
        required: true,
      }))
    : []

  return {
    instruction: step.instructions,
    fields,
    canAdvance: true,
  }
}
