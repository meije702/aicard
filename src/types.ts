// Domain types for AICard. Variable names and type names reflect the domain vocabulary.
// See docs/AICard_Domain_Language.md for definitions.

// --- Sous chef provider config ---

export type SousChefProviderId = 'anthropic' | 'openai' | 'gemini' | 'mistral' | 'ollama'

export interface SousChefConfig {
  provider: SousChefProviderId
  apiKey: string       // empty string for Ollama (no key required)
  baseUrl?: string     // override — used for Ollama (http://localhost:11434)
}

// --- Recipe and kitchen types ---

export type CardType = 'listen' | 'wait' | 'send-message'

export type CardConfig = Record<string, string>

// A step in a recipe that runs a card
export interface CardStep {
  number: number
  name: string
  card: CardType
  config: CardConfig
}

// A step in a recipe that calls another recipe (v1: parsed but not yet executed)
export interface SubRecipeStep {
  number: number
  name: string
  recipe: string
}

export type RecipeStep = CardStep | SubRecipeStep

// The parsed structure of a .recipe.md file
export interface Recipe {
  name: string
  purpose: string
  kitchen: string[]      // equipment names this recipe needs
  steps: RecipeStep[]
  errors: string[]       // parse problems — never throw, always accumulate
}

// A piece of equipment the kitchen has connected
export interface Equipment {
  name: string
  type: string           // e.g. "shopify", "gmail", "discord"
  connected: boolean
  config: Record<string, string>
}

// The result of checking whether the kitchen has what a card needs
export interface EquipmentCheck {
  ready: boolean
  missing: string[]      // equipment names that are needed but not connected
}

// Data accumulated as a recipe runs; each step's output is stored here
export type RecipeContext = Record<string, Record<string, string>>

// The result a card executor returns after running
export interface CardResult {
  success: boolean
  output: Record<string, string>   // key-value data passed to the next step
  message: string                  // plain-English description of what happened
}

// The full kitchen state — backed by localStorage in the browser
export interface Kitchen {
  equipment: Equipment[]
  recipes: Recipe[]
  pantry: CardDefinition[]
}

// The parsed structure of a .card.md file
export interface CardDefinition {
  name: string
  type: CardType
  purpose: string
  equipment: CardEquipmentRequirement[]
  configFields: CardConfigField[]
}

export interface CardEquipmentRequirement {
  description: string
  required: boolean
}

export interface CardConfigField {
  name: string           // normalised lowercase key
  description: string
}
