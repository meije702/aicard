// Equipment connection types and helpers.
// Equipment is what makes certain cards work — a shop, email account, etc.

import type { Equipment } from '../types.ts'

// Create a new equipment entry for the kitchen.
// Equipment starts disconnected until the user completes the connection flow.
export function createEquipment(name: string, type: string): Equipment {
  return {
    name,
    type: type.toLowerCase(),
    connected: false,
    config: {},
  }
}

// Check whether the kitchen has a specific piece of equipment connected.
export function isEquipmentConnected(kitchen: Equipment[], name: string): boolean {
  return kitchen.some(
    e => e.name.toLowerCase() === name.toLowerCase() && e.connected
  )
}

// Lower-level equipment readiness check: given a list of needed equipment names,
// return which ones are missing or disconnected. Used by the higher-level
// checkRecipeReadiness() in recipe-readiness.ts which also checks card-type
// availability and executor-specific needs.
//
// Check which equipment a recipe needs and which is missing from the kitchen.
export function checkKitchenReadiness(
  needed: string[],
  equipment: Equipment[]
): { ready: boolean; missing: string[] } {
  const missing = needed.filter(name => !isEquipmentConnected(equipment, name))
  return { ready: missing.length === 0, missing }
}
