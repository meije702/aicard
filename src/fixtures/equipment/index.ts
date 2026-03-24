// Equipment definition lookup — loads .equipment.md fixtures at build time.
// New equipment = new .md file, zero code changes needed here.

import type { EquipmentDefinition } from '../../types.ts'
import { parseEquipmentDefinition } from '../../parser/equipment-parser.ts'
import shopifyMd from './shopify.equipment.md?raw'
import gmailMd from './gmail.equipment.md?raw'

// Parse all fixtures once at import time
const definitions: EquipmentDefinition[] = [
  parseEquipmentDefinition(shopifyMd),
  parseEquipmentDefinition(gmailMd),
]

// Case-insensitive lookup by equipment name (same pattern as EquipmentConnect.getEquipmentProfile)
export function getEquipmentDefinition(name: string): EquipmentDefinition | undefined {
  const lower = name.toLowerCase()
  return definitions.find(d => d.name.toLowerCase() === lower)
    ?? definitions.find(d => lower.includes(d.name.toLowerCase()))
}
