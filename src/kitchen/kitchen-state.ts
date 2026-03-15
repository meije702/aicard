// Kitchen state backed by localStorage.
// The kitchen holds the user's equipment, recipes, and pantry.
//
// Design: the kitchen state is the single source of truth for what is in the user's
// workspace. All reads and writes go through these functions.

import type { Kitchen, Equipment, Recipe, CardDefinition } from '../types.ts'

const STORAGE_KEY = 'aicard:kitchen'

// Load the kitchen from localStorage, or return an empty kitchen.
export function loadKitchen(): Kitchen {
  if (typeof localStorage === 'undefined') {
    // Running in a test environment — return an empty kitchen
    return emptyKitchen()
  }

  const raw = localStorage.getItem(STORAGE_KEY)
  if (!raw) return emptyKitchen()

  try {
    return JSON.parse(raw) as Kitchen
  } catch {
    // If the stored data is malformed, start fresh rather than crashing
    return emptyKitchen()
  }
}

// Save the kitchen to localStorage.
export function saveKitchen(kitchen: Kitchen): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(kitchen))
}

// Add or update a piece of equipment in the kitchen.
export function upsertEquipment(kitchen: Kitchen, equipment: Equipment): Kitchen {
  const existing = kitchen.equipment.findIndex(
    e => e.name.toLowerCase() === equipment.name.toLowerCase()
  )

  const updated = existing >= 0
    ? kitchen.equipment.map((e, i) => (i === existing ? equipment : e))
    : [...kitchen.equipment, equipment]

  return { ...kitchen, equipment: updated }
}

// Remove a piece of equipment from the kitchen.
export function removeEquipment(kitchen: Kitchen, name: string): Kitchen {
  return {
    ...kitchen,
    equipment: kitchen.equipment.filter(
      e => e.name.toLowerCase() !== name.toLowerCase()
    ),
  }
}

// Add a parsed recipe to the kitchen's recipe collection.
// Recipes are identified by name — adding one with the same name replaces it.
export function upsertRecipe(kitchen: Kitchen, recipe: Recipe): Kitchen {
  const existing = kitchen.recipes.findIndex(
    r => r.name.toLowerCase() === recipe.name.toLowerCase()
  )

  const updated = existing >= 0
    ? kitchen.recipes.map((r, i) => (i === existing ? recipe : r))
    : [...kitchen.recipes, recipe]

  return { ...kitchen, recipes: updated }
}

// Add a card definition to the pantry.
// Card definitions are identified by type.
export function upsertCardDefinition(kitchen: Kitchen, card: CardDefinition): Kitchen {
  const existing = kitchen.pantry.findIndex(c => c.type === card.type)

  const updated = existing >= 0
    ? kitchen.pantry.map((c, i) => (i === existing ? card : c))
    : [...kitchen.pantry, card]

  return { ...kitchen, pantry: updated }
}

function emptyKitchen(): Kitchen {
  return {
    equipment: [],
    recipes: [],
    pantry: [],
  }
}
