// Domain types for AICard. Variable names and type names reflect the domain vocabulary.
// See docs/AICard_Domain_Language.md for definitions.

// --- Parser result types ---

// Returned by pure parser helper functions — value plus any errors accumulated.
export type ParseResult<T> = { value: T; errors: string[] }

// Returned by parseRecipe — forces callers to handle the error case explicitly
// before passing a recipe to the runner.
export type ParsedRecipe =
    | { success: true;  recipe: Recipe }
    | { success: false; errors: string[]; partialRecipe: Partial<Recipe> }

// --- Sous chef provider config ---

export type SousChefProviderId = 'anthropic' | 'openai' | 'gemini' | 'mistral' | 'ollama'

export interface SousChefConfig {
  provider: SousChefProviderId
  apiKey: string       // empty string for Ollama (no key required)
  baseUrl?: string     // override — used for Ollama (http://localhost:11434)
  model?: string       // override — lets user pick a specific model (e.g. Ollama)
}

// Multi-provider storage — one entry per provider the user has configured.
// SousChefSetup is the storage format; SousChefConfig is the resolved active config.
export interface SousChefProviderEntry {
  apiKey: string       // empty string for Ollama
  baseUrl?: string     // Ollama: http://localhost:11434
  model?: string       // user-chosen model (e.g. 'llama3.2', 'mistral')
}

export interface SousChefSetup {
  active: SousChefProviderId | null
  providers: Partial<Record<SousChefProviderId, SousChefProviderEntry>>
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
  // 'full': can act on Maria's behalf (e.g. direct API access)
  // 'handoff': prepares something for Maria to send/complete herself (e.g. mailto:)
  // Defaults to 'full' when not set — backwards-compatible with existing localStorage data.
  mode?: 'full' | 'handoff'
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
  houseStyle?: string        // the user's voice and preferences — see docs/AICard_Techniques.md
  journal?: JournalEntry[]   // append-only kitchen journal — see docs/AICard_Techniques.md
}

// The structured knowledge that makes the sous chef competent at a specific card.
// See docs/AICard_Techniques.md for the design.
export interface Technique {
  voice: string
  constraints: string
  expertise: string
}

// The parsed structure of a .card.md file
export interface CardDefinition {
  name: string
  type: CardType
  purpose: string
  equipment: CardEquipmentRequirement[]
  configFields: CardConfigField[]
  technique?: Technique
}

export interface CardEquipmentRequirement {
  description: string
  required: boolean
}

export interface CardConfigField {
  name: string           // normalised lowercase key
  description: string
}

// --- Kitchen journal types ---

export type JournalEntryType = 'executed' | 'corrected' | 'approved'

// An entry in the kitchen journal — the sous chef's memory.
export interface JournalEntry {
  timestamp: string        // ISO 8601
  recipe: string           // recipe name
  step: number             // step number
  card: CardType           // card type
  type: JournalEntryType
  before?: string          // original output (for corrections)
  after?: string           // corrected output (for corrections)
}

// --- Prompt context (DIP: sous chef receives this, never looks up kitchen internals) ---

// All the context the sous chef needs for one card execution.
// Built by buildPromptContext() — the single assembly point.
export interface PromptContext {
  technique?: Technique
  houseStyle?: string
  recentCorrections: JournalEntry[]
  stepContext: string
}
