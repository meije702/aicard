// Kitchen state: pure domain transforms + repository abstraction for persistence.
// The kitchen holds the user's equipment, recipes, and pantry.
//
// Pure functions (upsertEquipment, removeEquipment, etc.) transform Kitchen values.
// Persistence is behind the KitchenRepository interface — the production implementation
// uses localStorage; tests can inject an in-memory stub.

import type { Kitchen, Equipment, Recipe, CardDefinition } from '../types.ts'

// Abstraction over kitchen persistence — same pattern as RunStateRepository.
export interface KitchenRepository {
  load(): Kitchen
  save(kitchen: Kitchen): void
}

const STORAGE_KEY = 'aicard:kitchen'

// Production implementation backed by window.localStorage.
// All methods are no-ops / return empty when localStorage is unavailable (e.g. tests).
export const localStorageKitchenRepository: KitchenRepository = {
  load(): Kitchen {
    if (typeof localStorage === 'undefined') return emptyKitchen()
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return emptyKitchen()
    try {
      return JSON.parse(raw) as Kitchen
    } catch {
      return emptyKitchen()
    }
  },

  save(kitchen: Kitchen): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(STORAGE_KEY, JSON.stringify(kitchen))
  },
}

// Convenience aliases that delegate to the default repository.
// Keeps existing call-sites working without a breaking change.
export function loadKitchen(): Kitchen {
  return localStorageKitchenRepository.load()
}

export function saveKitchen(kitchen: Kitchen): void {
  localStorageKitchenRepository.save(kitchen)
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
