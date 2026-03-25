// Manages recipe execution lifecycle: run state, running flag, cancellation,
// journal logging for completed steps, and description overrides for tweaked steps.

import { useState, useRef } from 'react'
import type { Recipe, Kitchen, JournalEntry } from '../../types.ts'
import type { RunState } from '../../runner/recipe-runner.ts'
import { runRecipe, defaultExecutors } from '../../runner/recipe-runner.ts'
import { createSubRecipeRunner } from '../../runner/sub-recipe-runner.ts'
import { localStorageRunStateRepository as runStateRepo } from '../../runner/run-state-repository.ts'

interface ExecutionCallbacks {
  onInteraction: (stepIndex: number, interaction: import('../../cards/card-executor.ts').StepInteraction) => Promise<Record<string, string>>
  onPreStepReview: (stepIndex: number) => Promise<void>
  onJournalEntry?: (entry: JournalEntry) => void
}

export function useRecipeExecution(kitchen: Kitchen, recipeName?: string) {
  // Hydrate from localStorage synchronously during initialization so the first
  // render already shows the paused banner. Using an effect would cause a flash
  // where controls briefly show the wrong state before flipping to paused.
  const [runState, setRunState] = useState<RunState | null>(() =>
    recipeName ? runStateRepo.load(recipeName) : null
  )
  const [isRunning, setIsRunning] = useState(false)
  const cancelRef = useRef(false)
  const loggedStepsRef = useRef<Set<number>>(new Set())
  const tweakedDescriptionsRef = useRef<Record<number, string>>({})
  const activeRecipeRef = useRef<Recipe | null>(null)

  const isPaused = runState !== null && !runState.complete && !isRunning

  function handleStartFresh() {
    if (runState) runStateRepo.clear(runState.runId)
    setRunState(null)
  }

  function handleStop(reviewResolveRef: React.MutableRefObject<(() => void) | null>, setReviewingStepIndex: (v: number | null) => void) {
    cancelRef.current = true
    if (reviewResolveRef.current) {
      reviewResolveRef.current()
      reviewResolveRef.current = null
    }
    setReviewingStepIndex(null)
  }

  async function handleRun(
    recipe: Recipe,
    callbacks: ExecutionCallbacks,
    cleanup: () => void,
  ) {
    runStateRepo.clearAll(recipe.name)
    cancelRef.current = false
    tweakedDescriptionsRef.current = {}
    loggedStepsRef.current = new Set()
    activeRecipeRef.current = recipe
    setIsRunning(true)
    setRunState(null)

    const finalState = await runRecipe(
      recipe,
      kitchen,
      (state) => {
        const overrides = tweakedDescriptionsRef.current
        const mergedSteps = state.steps.map((s, i) => {
          if (s.status !== 'pending') {
            delete overrides[i]
            return s
          }
          return overrides[i] ? { ...s, description: overrides[i] } : s
        })
        setRunState({ ...state, steps: mergedSteps })
        runStateRepo.save(state)
        if (callbacks.onJournalEntry) {
          for (const step of state.steps) {
            if (step.status === 'complete' && !loggedStepsRef.current.has(step.number)) {
              loggedStepsRef.current.add(step.number)
              const recipeStep = recipe.steps[step.number - 1]
              const cardType = recipeStep && 'card' in recipeStep ? recipeStep.card : undefined
              if (cardType) {
                callbacks.onJournalEntry({
                  timestamp: new Date().toISOString(),
                  recipe: recipe.name,
                  step: step.number,
                  card: cardType,
                  type: 'executed',
                })
              }
            }
          }
        }
      },
      callbacks.onInteraction,
      (stepIndex) => {
        const step = activeRecipeRef.current!.steps[stepIndex]
        return ('card' in step) ? step.config : null
      },
      undefined,
      () => cancelRef.current,
      callbacks.onPreStepReview,
      createSubRecipeRunner(kitchen, defaultExecutors),
    )

    setRunState(finalState)
    setIsRunning(false)
    cleanup()

    if (finalState.complete) {
      runStateRepo.clearAll(recipe.name)
    }
    if (finalState.cancelled) {
      runStateRepo.clearAll(recipe.name)
      setRunState(null)
    }
  }

  return {
    runState,
    setRunState,
    isRunning,
    isPaused,
    cancelRef,
    activeRecipeRef,
    tweakedDescriptionsRef,
    handleRun,
    handleStop,
    handleStartFresh,
  }
}
