// The shared interface every card executor must implement.
// See CLAUDE.md for the design rationale behind describe() — it is as
// important as execute(). Maria needs to see what is happening in
// language she trusts.

import type { CardType, CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'

// A request from a card executor to the user for input during execution.
// The Listen card uses this to ask Maria to enter event details.
// The Send Message card uses this to show a composed message for review.
export interface StepInteraction {
  prompt: string
  fields: StepInteractionField[]
}

export interface StepInteractionField {
  key: string
  label: string
  placeholder?: string
  // If provided, the field is pre-filled (e.g., Send Message shows the composed message)
  defaultValue?: string
  // If true, the field is read-only (display only, not editable)
  readOnly?: boolean
}

// Callback an executor calls to request user input mid-execution.
// The runner bridges this to the UI, which renders an inline form.
// Returns the user's field values when they submit.
export type OnInteraction = (interaction: StepInteraction) => Promise<Record<string, string>>

export interface CardExecutor {
  type: CardType

  // Check that the kitchen has everything this card needs before the recipe runs.
  // Called by the sous chef during the readiness check.
  // Config is passed so executors can validate against specific equipment names
  // (e.g., the Listen card needs the service named in its "from" config).
  checkEquipment(kitchen: Kitchen, config: CardConfig): EquipmentCheck

  // Run the card. Returns output data that flows into the next step's context.
  // onInteraction is optional — executors that need user input call it;
  // executors that don't (like Wait) ignore it.
  // When onInteraction is undefined (test/headless mode), executors should
  // fall back to placeholder behavior.
  execute(
    config: CardConfig,
    context: RecipeContext,
    kitchen: Kitchen,
    onInteraction?: OnInteraction
  ): Promise<CardResult>

  // Return a plain-English description of what this step is doing right now.
  // Used by the UI to show "Waiting 3 days..." not "Card: wait executing".
  describe(config: CardConfig): string
}
