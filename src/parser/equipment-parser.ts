// Parse an .equipment.md file into an EquipmentDefinition object.
// Follows the same conventions as card-parser.ts: never throw, accumulate errors.

import type { EquipmentDefinition, DocumentationLink, EquipmentStep, EquipmentConfigField, Technique } from '../types.ts'
import { extractSection, extractSubsections } from './section-helpers.ts'

export function parseEquipmentDefinition(markdown: string): EquipmentDefinition {
  const lines = markdown.split('\n')
  const errors: string[] = []

  const name = parseName(lines)
  if (!name) errors.push('Equipment definition is missing a title (# heading).')

  const purpose = parsePurpose(lines)
  const mode = parseMode(lines)
  const documentation = parseDocumentation(lines)
  const steps = parseSteps(lines, errors)
  const configFields = parseConfigFields(lines)
  const technique = parseTechnique(lines)

  return { name, purpose, mode, documentation, steps, configFields, technique, errors }
}

// Parse the equipment name from the first # heading
function parseName(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/)
    if (match) return match[1].trim()
  }
  return ''
}

// Parse the purpose from the first blockquote
function parsePurpose(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^>\s+(.+)$/)
    if (match) return match[1].trim()
  }
  return ''
}

// Parse the ## Mode section. Defaults to 'api-key' when absent.
function parseMode(lines: string[]): 'api-key' | 'compose' {
  const sectionLines = extractSection(lines, '## Mode')
  const value = sectionLines.map(l => l.trim()).filter(Boolean).join('').toLowerCase()
  if (value === 'compose') return 'compose'
  return 'api-key'
}

// Parse the ## Documentation section into a list of labelled URLs.
// Format: - Label: https://example.com
function parseDocumentation(lines: string[]): DocumentationLink[] {
  const sectionLines = extractSection(lines, '## Documentation')
  const links: DocumentationLink[] = []

  for (const line of sectionLines) {
    const match = line.match(/^-\s+(.+?):\s+(https?:\/\/.+)$/)
    if (match) {
      links.push({ label: match[1].trim(), url: match[2].trim() })
    }
  }

  return links
}

// Parse the ## Steps section into numbered steps.
// Each ### N. Title starts a step; following lines are the instructions.
function parseSteps(lines: string[], errors: string[]): EquipmentStep[] {
  const sectionLines = extractSection(lines, '## Steps')
  if (sectionLines.length === 0) {
    errors.push('Equipment definition is missing a ## Steps section.')
    return []
  }

  const steps: EquipmentStep[] = []
  let currentStep: { number: number; title: string } | null = null
  const instructionLines: string[] = []

  function flush() {
    if (currentStep) {
      steps.push({
        number: currentStep.number,
        title: currentStep.title,
        instructions: instructionLines.join('\n').trim(),
      })
    }
  }

  for (const line of sectionLines) {
    const headingMatch = line.match(/^###\s+(\d+)\.\s+(.+)$/)
    if (headingMatch) {
      flush()
      currentStep = { number: parseInt(headingMatch[1], 10), title: headingMatch[2].trim() }
      instructionLines.length = 0
    } else if (currentStep) {
      instructionLines.push(line)
    }
  }
  flush()

  if (steps.length === 0) {
    errors.push('## Steps section has no numbered steps (expected ### 1. Title format).')
  }

  return steps
}

// Parse the ## Config Fields section.
// Format: - Field name: description
//           - validate: rule (optional, indented)
// "None." or "None" signals no config fields.
function parseConfigFields(lines: string[]): EquipmentConfigField[] {
  const sectionLines = extractSection(lines, '## Config Fields')
  const fields: EquipmentConfigField[] = []

  for (let i = 0; i < sectionLines.length; i++) {
    const line = sectionLines[i]
    // Top-level list item: - Name: description
    const fieldMatch = line.match(/^-\s+(.+?):\s+(.+)$/)
    if (!fieldMatch) continue

    const name = fieldMatch[1].trim()
    if (name.toLowerCase() === 'none.' || name.toLowerCase() === 'none') continue

    const description = fieldMatch[2].trim()
    let validate: string | undefined

    // Check next line for indented validate rule
    if (i + 1 < sectionLines.length) {
      const nextLine = sectionLines[i + 1]
      const validateMatch = nextLine.match(/^\s+-\s+validate:\s+(.+)$/)
      if (validateMatch) {
        validate = validateMatch[1].trim()
        i++ // skip the validate line
      }
    }

    fields.push({ name, description, validate })
  }

  return fields
}

// Parse the optional ## Technique section (reuses the shared pattern from card-parser)
function parseTechnique(lines: string[]): Technique | undefined {
  const sectionLines = extractSection(lines, '## Technique')
  if (sectionLines.length === 0) return undefined

  const subsections = extractSubsections(sectionLines)
  const voice = subsections['voice'] ?? ''
  const constraints = subsections['constraints'] ?? ''
  const expertise = subsections['expertise'] ?? ''

  if (!voice && !constraints && !expertise) return undefined

  return { voice, constraints, expertise }
}
