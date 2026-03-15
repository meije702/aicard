// The shared interface every card executor must implement.
// See CLAUDE.md for the design rationale behind describe() — it is as
// important as execute(). Maria needs to see what is happening in
// language she trusts.

import type { CardType, CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'

export interface CardExecutor {
  type: CardType

  // Check that the kitchen has everything this card needs before the recipe runs.
  // Called by the sous chef during the readiness check.
  checkEquipment(kitchen: Kitchen): EquipmentCheck

  // Run the card. Returns output data that flows into the next step's context.
  execute(
    config: CardConfig,
    context: RecipeContext,
    kitchen: Kitchen
  ): Promise<CardResult>

  // Return a plain-English description of what this step is doing right now.
  // Used by the UI to show "Waiting 3 days..." not "Card: wait executing".
  describe(config: CardConfig): string
}
