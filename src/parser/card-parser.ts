// Parse a .card.md file into a CardDefinition object.
// See docs/AICard_Card_Format.md for the format specification.

import type { CardDefinition, CardType, CardEquipmentRequirement, CardConfigField } from '../types.ts'

export function parseCard(markdown: string): CardDefinition {
  const lines = markdown.split('\n')

  const name = parseName(lines)
  const type = normaliseCardType(name)
  const purpose = parsePurpose(lines)
  const equipment = parseEquipment(lines)
  const configFields = parseConfigFields(lines)

  return { name, type, purpose, equipment, configFields }
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

// Extract the lines belonging to a named section (up to the next ## heading).
// Case-insensitive: "## equipment" and "## EQUIPMENT" both match "## Equipment".
function extractSection(lines: string[], heading: string): string[] {
  const result: string[] = []
  let inSection = false

  for (const line of lines) {
    if (line.trim().toLowerCase() === heading.toLowerCase()) {
      inSection = true
      continue
    }
    if (inSection && /^##\s/.test(line) && line.trim().toLowerCase() !== heading.toLowerCase()) {
      break
    }
    if (inSection) result.push(line)
  }

  return result
}

// Normalise a card type name to lowercase-hyphenated
function normaliseCardType(name: string): CardType {
  return name.toLowerCase().replace(/\s+/g, '-') as CardType
}
