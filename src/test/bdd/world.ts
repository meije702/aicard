// World: per-scenario shared state for BDD tests.
// A fresh World is created before each scenario runs, ensuring isolation.

import type {
  Recipe,
  CardDefinition,
  Kitchen,
  CardResult,
  EquipmentDefinition,
  WizardStepResponse,
} from '../../types.ts'
import type { RunState } from '../../runner/recipe-runner.ts'

export class World {
  // Raw input text (recipe or card markdown)
  rawText: string | null = null

  // Parsed objects
  recipe: Recipe | null = null
  cardDefinition: CardDefinition | null = null
  // Parse errors are populated by When steps but not asserted by current BDD
  // scenarios — parser error details are covered by unit tests. These fields
  // exist so future user-visible failure scenarios (e.g. "invalid card shows
  // error dialog") have infrastructure ready without changing the When steps.
  cardParseErrors: string[] = []
  equipmentParseErrors: string[] = []
  equipmentDefinition: EquipmentDefinition | null = null

  // Kitchen state
  kitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }

  // Execution results
  runState: RunState | null = null
  cardResult: CardResult | null = null
  error: Error | null = null

  // Wizard state
  wizardStepResponse: WizardStepResponse | null = null

  // Timing
  startedAt: number | null = null
}
