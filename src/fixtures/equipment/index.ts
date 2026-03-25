// Equipment definition lookup — loads .equipment.md fixtures at build time.
// New equipment = new .md file, zero code changes needed here.

import type { EquipmentDefinition } from '../../types.ts'
import { parseEquipmentDefinition } from '../../parser/equipment-parser.ts'
import shopifyMd from './shopify.equipment.md?raw'
import gmailMd from './gmail.equipment.md?raw'

// Bundled fixtures are product assets — if they fail to parse, that's a
// build-time bug, not a runtime condition to handle gracefully.
function unwrapOrThrow(markdown: string, label: string): EquipmentDefinition {
  const parsed = parseEquipmentDefinition(markdown)
  if (parsed.success) return parsed.equipment
  throw new Error(`Bundled ${label} equipment fixture failed to parse: ${parsed.errors.join('; ')}`)
}

const definitions: EquipmentDefinition[] = [
  unwrapOrThrow(shopifyMd, 'Shopify'),
  unwrapOrThrow(gmailMd, 'Gmail'),
]

// Case-insensitive lookup by equipment name (same pattern as EquipmentConnect.getEquipmentProfile)
export function getEquipmentDefinition(name: string): EquipmentDefinition | undefined {
  const lower = name.toLowerCase()
  return definitions.find(d => d.name.toLowerCase() === lower)
    ?? definitions.find(d => lower.includes(d.name.toLowerCase()))
}
