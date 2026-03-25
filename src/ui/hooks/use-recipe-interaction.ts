// Manages pending user interactions during recipe execution:
// which step is waiting for input, the resolve callback, and journal logging.

import { useState, useCallback, useRef } from 'react'
import type { JournalEntry, Recipe } from '../../types.ts'
import type { StepInteraction as StepInteractionType } from '../../cards/card-executor.ts'

export interface PendingInteraction {
  stepIndex: number
  interaction: StepInteractionType
  resolve: (values: Record<string, string>) => void
}

export function useRecipeInteraction(
  activeRecipe: Recipe,
  onJournalEntry?: (entry: JournalEntry) => void,
) {
  const [pendingInteraction, setPendingInteraction] = useState<PendingInteraction | null>(null)
  const interactionResolveRef = useRef<((values: Record<string, string>) => void) | null>(null)

  const handleInteractionSubmit = useCallback((values: Record<string, string>) => {
    if (onJournalEntry && pendingInteraction) {
      const { stepIndex, interaction } = pendingInteraction
      const recipeStep = activeRecipe.steps[stepIndex]
      const cardType = recipeStep && 'card' in recipeStep ? recipeStep.card : undefined
      if (cardType && interaction.fields) {
        const editableFields = interaction.fields.filter(f => !f.readOnly)
        for (const field of editableFields) {
          const original = field.defaultValue ?? ''
          const submitted = values[field.key] ?? ''
          if (original !== submitted) {
            onJournalEntry({
              timestamp: new Date().toISOString(),
              recipe: activeRecipe.name,
              step: stepIndex + 1,
              card: cardType,
              type: 'corrected',
              before: original,
              after: submitted,
            })
          }
        }
      }
    }

    if (interactionResolveRef.current) {
      interactionResolveRef.current(values)
      interactionResolveRef.current = null
    }
    setPendingInteraction(null)
  }, [onJournalEntry, pendingInteraction, activeRecipe])

  // Creates the onInteraction callback for the runner.
  function createInteractionCallback(stepIndex: number, interaction: StepInteractionType): Promise<Record<string, string>> {
    return new Promise<Record<string, string>>((resolve) => {
      interactionResolveRef.current = resolve
      setPendingInteraction({ stepIndex, interaction, resolve })
    })
  }

  return {
    pendingInteraction,
    setPendingInteraction,
    handleInteractionSubmit,
    createInteractionCallback,
  }
}
