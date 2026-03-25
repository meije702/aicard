// Parse a .card.md file into a CardDefinition object.
// See docs/AICard_Card_Format.md for the format specification.

import type { CardEquipmentRequirement, CardConfigField, Technique, ParsedCard } from '../types.ts'
import { extractSection, extractSubsections } from './section-helpers.ts'
import { KNOWN_CARD_TYPES, normaliseCardType } from './card-type.ts'

export function parseCard(markdown: string): ParsedCard {
  const lines = markdown.split('\n')
  const errors: string[] = []

  const name = parseName(lines)
  if (!name) errors.push('Card definition is missing a title (# heading).')

  const type = normaliseCardType(name)
  if (name && type === null) {
    errors.push(
      `Unknown card type "${name}". Known types: ${KNOWN_CARD_TYPES.join(', ')}.`,
    )
  }

  const purpose = parsePurpose(lines)
  const equipment = parseEquipment(lines)
  const configFields = parseConfigFields(lines)
  const technique = parseTechnique(lines)

  if (errors.length > 0) {
    return {
      success: false,
      errors,
      partialCard: { name, purpose, equipment, configFields, technique },
    }
  }

  return { success: true, card: { name, type: type!, purpose, equipment, configFields, technique } }
}

// Parse the card name from the first # heading
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

// Parse the ## Equipment section into requirements.
// "None." signals that the card needs no equipment.
function parseEquipment(lines: string[]): CardEquipmentRequirement[] {
  const sectionLines = extractSection(lines, '## Equipment')
  const requirements: CardEquipmentRequirement[] = []

  for (const line of sectionLines) {
    const match = line.match(/^-\s+(.+)$/)
    if (!match) continue

    const text = match[1].trim()
    if (text.toLowerCase() === 'none.' || text.toLowerCase() === 'none') continue

    const required = /\(required\)/i.test(text)
    const description = text.replace(/\s*\(required\)/i, '').replace(/\s*\(optional\)/i, '').trim()
    requirements.push({ description, required })
  }

  return requirements
}

// Parse the ## Config section into config field definitions.
// Each ### heading is a field name; the lines below it are the description.
function parseConfigFields(lines: string[]): CardConfigField[] {
  const sectionLines = extractSection(lines, '## Config')
  const fields: CardConfigField[] = []

  let currentName = ''
  const descLines: string[] = []

  function flush() {
    if (currentName) {
      fields.push({ name: currentName.toLowerCase(), description: descLines.join(' ').trim() })
    }
  }

  for (const line of sectionLines) {
    const headingMatch = line.match(/^###\s+(.+)$/)
    if (headingMatch) {
      flush()
      currentName = headingMatch[1].trim()
      descLines.length = 0
    } else if (currentName && line.trim()) {
      descLines.push(line.trim())
    }
  }
  flush()

  return fields
}

// Parse the optional ## Technique section into a Technique object.
// Technique has three subsections: ### Voice, ### Constraints, ### Expertise.
// Returns undefined when the section is absent.
function parseTechnique(lines: string[]): Technique | undefined {
  const sectionLines = extractSection(lines, '## Technique')
  if (sectionLines.length === 0) return undefined

  const subsections = extractSubsections(sectionLines)
  const voice = subsections['voice'] ?? ''
  const constraints = subsections['constraints'] ?? ''
  const expertise = subsections['expertise'] ?? ''

  // Only return a technique if at least one subsection has content
  if (!voice && !constraints && !expertise) return undefined

  return { voice, constraints, expertise }
}


