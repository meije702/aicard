// World: per-scenario shared state for BDD tests.
// A fresh World is created before each scenario runs, ensuring isolation.

import type {
  Recipe,
  CardDefinition,
  Kitchen,
  CardResult,
} from '../../types.ts'
import type { RunState } from '../../runner/recipe-runner.ts'

export class World {
  // Raw input text (recipe or card markdown)
  rawText: string | null = null

  // Parsed objects
  recipe: Recipe | null = null
  cardDefinition: CardDefinition | null = null

  // Kitchen state
  kitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }

  // Execution results
  runState: RunState | null = null
  cardResult: CardResult | null = null
  error: Error | null = null
}
