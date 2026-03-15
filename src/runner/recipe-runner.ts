// The recipe runner: wires parser → executors → kitchen state into a running recipe.
// This is the engine. The UI calls it; the sous chef monitors it.

import type {
  Recipe,
  CardStep,
  RecipeContext,
  CardResult,
  Kitchen,
} from '../types.ts'
import type { CardExecutor } from '../cards/card-executor.ts'
import { listenExecutor } from '../cards/listen.ts'
import { waitExecutor } from '../cards/wait.ts'
import { sendMessageExecutor } from '../cards/send-message.ts'

// All available card executors, keyed by card type
const executors: Record<string, CardExecutor> = {
  listen: listenExecutor,
  wait: waitExecutor,
  'send-message': sendMessageExecutor,
}

export type StepStatus = 'pending' | 'running' | 'complete' | 'failed' | 'skipped'

export interface StepState {
  number: number
  name: string
  description: string    // the describe() output — plain English
  status: StepStatus
  result?: CardResult
}

export interface RunState {
  recipeName: string
  steps: StepState[]
  context: RecipeContext
  complete: boolean
  errors: string[]
}

// Callback fired whenever the run state changes (a step starts, completes, etc.)
export type OnStateChange = (state: RunState) => void

// Run a recipe against the kitchen, calling onStateChange after each step.
// Returns the final run state.
export async function runRecipe(
  recipe: Recipe,
  kitchen: Kitchen,
  onStateChange?: OnStateChange
): Promise<RunState> {
  const context: RecipeContext = {}
  const errors: string[] = []

  // Build the initial state for all steps
  const steps: StepState[] = recipe.steps.map(step => {
    if ('card' in step) {
      const executor = executors[step.card]
      return {
        number: step.number,
        name: step.name,
        description: executor?.describe(step.config) ?? `Step: ${step.name}`,
        status: 'pending' as StepStatus,
      }
    }
    // Sub-recipe step — not yet supported in v1
    return {
      number: step.number,
      name: step.name,
      description: `Sub-recipe "${step.recipe}" — not yet supported`,
      status: 'skipped' as StepStatus,
    }
  })

  const state: RunState = {
    recipeName: recipe.name,
    steps,
    context,
    complete: false,
    errors,
  }

  onStateChange?.({ ...state, steps: [...steps] })

  // Run each step in sequence
  for (let i = 0; i < recipe.steps.length; i++) {
    const recipeStep = recipe.steps[i]
    const stepState = steps[i]

    // Sub-recipe steps are skipped in v1
    if (!('card' in recipeStep)) {
      stepState.status = 'skipped'
      onStateChange?.({ ...state, steps: [...steps] })
      continue
    }

    const cardStep = recipeStep as CardStep
    const executor = executors[cardStep.card]

    if (!executor) {
      stepState.status = 'failed'
      stepState.result = {
        success: false,
        output: {},
        message: `Unknown card type: "${cardStep.card}". This card hasn't been added to your pantry yet.`,
      }
      errors.push(stepState.result.message)
      onStateChange?.({ ...state, steps: [...steps] })
      continue
    }

    // Mark as running
    stepState.status = 'running'
    onStateChange?.({ ...state, steps: [...steps] })

    try {
      const result = await executor.execute(cardStep.config, context, kitchen)
      stepState.result = result
      stepState.status = result.success ? 'complete' : 'failed'

      // Add this step's output to the context so later steps can reference it
      if (result.success) {
        context[`step ${cardStep.number}`] = result.output
      } else {
        errors.push(result.message)
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err)
      stepState.status = 'failed'
      stepState.result = {
        success: false,
        output: {},
        message: `Something went wrong in the "${cardStep.name}" step. ${message}`,
      }
      errors.push(stepState.result.message)
    }

    onStateChange?.({ ...state, steps: [...steps] })

    // Stop running if a step failed
    if (stepState.status === 'failed') break
  }

  state.complete = steps.every(s => s.status === 'complete' || s.status === 'skipped')
  onStateChange?.({ ...state, steps: [...steps] })

  return { ...state, steps: [...steps] }
}

// Check whether the kitchen is ready to run a recipe.
// Two layers of checking:
//   1. Recipe-level: the ## Kitchen section lists equipment by name
//   2. Card-level: each card executor's checkEquipment() may flag its own needs
// Both must pass for the recipe to be ready.
export function checkRecipeReadiness(
  recipe: Recipe,
  kitchen: Kitchen
): { ready: boolean; missing: string[] } {
  const missing: string[] = []

  // Layer 1: check that the equipment listed in the recipe's Kitchen section is connected
  for (const equipmentName of recipe.kitchen) {
    const found = kitchen.equipment.find(
      e => e.name.toLowerCase() === equipmentName.toLowerCase() && e.connected
    )
    if (!found) missing.push(equipmentName)
  }

  // Layer 2: ask each card executor if the kitchen has what it needs
  for (const step of recipe.steps) {
    if (!('card' in step)) continue
    const executor = executors[step.card]
    if (!executor) continue

    const check = executor.checkEquipment(kitchen)
    if (!check.ready) {
      for (const item of check.missing) {
        if (!missing.includes(item)) missing.push(item)
      }
    }
  }

  return { ready: missing.length === 0, missing }
}

// Return whether a recipe has any Wait steps (used to show the tab-open warning).
export function recipeHasWaitSteps(recipe: Recipe): boolean {
  return recipe.steps.some(step => 'card' in step && step.card === 'wait')
}

// Persist run state to localStorage so a mid-run tab close can be recovered.
// Keyed by recipe name so multiple recipes can have independent saved states.
const RUN_STATE_PREFIX = 'aicard:run:'

export function saveRunState(state: RunState): void {
  if (typeof localStorage === 'undefined') return
  localStorage.setItem(RUN_STATE_PREFIX + state.recipeName, JSON.stringify(state))
}

export function loadRunState(recipeName: string): RunState | null {
  if (typeof localStorage === 'undefined') return null
  const raw = localStorage.getItem(RUN_STATE_PREFIX + recipeName)
  if (!raw) return null
  try {
    return JSON.parse(raw) as RunState
  } catch {
    return null
  }
}

export function clearRunState(recipeName: string): void {
  if (typeof localStorage === 'undefined') return
  localStorage.removeItem(RUN_STATE_PREFIX + recipeName)
}
