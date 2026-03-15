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
import { resolveAllValues } from '../cards/resolve-value.ts'

// All available card executors, keyed by card type
const executors: Record<string, CardExecutor> = {
    listen: listenExecutor,
    wait: waitExecutor,
    'send-message': sendMessageExecutor,
}

export type StepStatus = 'pending' | 'running' | 'complete' | 'failed' | 'skipped'

// A typed readiness blocker: equipment the user needs to connect, or a card
// type that isn't in the pantry. Kept separate so the UI can render each kind
// with the right message and action.
export interface ReadinessBlocker {
    kind: 'equipment' | 'card-type'
    label: string
}

export interface StepState {
    number: number
    name: string
    description: string    // the describe() output — plain English
    status: StepStatus
    result?: CardResult
}

export interface RunState {
    runId: string           // unique run identity — prevents same-name recipe collisions in localStorage
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
        runId: `${recipe.name}:${Date.now()}`,
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

        // Resolve step references ({step N: key}) before passing config to the
        // executor. Unresolved references fail the step with a clear error instead
        // of flowing through as literal strings.
        const { resolved: resolvedConfig, errors: resolveErrors } = resolveAllValues(
            cardStep.config,
            context,
            cardStep.number
        )

        if (resolveErrors.length > 0) {
            stepState.status = 'failed'
            stepState.result = {
                success: false,
                output: {},
                message: resolveErrors[0],
            }
            errors.push(...resolveErrors)
            onStateChange?.({ ...state, steps: [...steps] })
            break
        }

        try {
            const result = await executor.execute(resolvedConfig, context, kitchen)
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
// Three layers of checking:
//   1. Recipe-level: the ## Kitchen section lists equipment by name
//   2. Pantry-level: each card type must exist in the executors map
//   3. Card-level: each card executor's checkEquipment() may flag its own needs
// All must pass. Returns typed blockers so the UI can render each kind
// with the right message — "Connect X" for equipment, not for card types.
export function checkRecipeReadiness(
    recipe: Recipe,
    kitchen: Kitchen
): { ready: boolean; blockers: ReadinessBlocker[] } {
    const blockers: ReadinessBlocker[] = []

    function hasBlocker(kind: ReadinessBlocker['kind'], label: string): boolean {
        return blockers.some(b => b.kind === kind && b.label === label)
    }

    // Layer 1: check that the equipment listed in the recipe's Kitchen section is connected
    for (const equipmentName of recipe.kitchen) {
        const found = kitchen.equipment.find(
            e => e.name.toLowerCase() === equipmentName.toLowerCase() && e.connected
        )
        if (!found && !hasBlocker('equipment', equipmentName)) {
            blockers.push({ kind: 'equipment', label: equipmentName })
        }
    }

    // Layer 2: check that all card types exist in the pantry
    for (const step of recipe.steps) {
        if (!('card' in step)) continue
        const executor = executors[step.card]
        if (!executor) {
            if (!hasBlocker('card-type', step.card)) {
                blockers.push({ kind: 'card-type', label: step.card })
            }
            continue
        }

        // Layer 3: ask each card executor if the kitchen has what it needs
        const check = executor.checkEquipment(kitchen, step.config)
        if (!check.ready) {
            for (const item of check.missing) {
                if (!hasBlocker('equipment', item)) {
                    blockers.push({ kind: 'equipment', label: item })
                }
            }
        }
    }

    return { ready: blockers.length === 0, blockers }
}

// Return whether a recipe has any Wait steps (used to show the tab-open warning).
export function recipeHasWaitSteps(recipe: Recipe): boolean {
    return recipe.steps.some(step => 'card' in step && step.card === 'wait')
}

// Persist run state to localStorage so a mid-run tab close can be recovered.
// Keyed by runId (not recipeName) so two recipes with the same name never
// overwrite each other. loadRunState scans for the most recent matching entry.
const RUN_STATE_PREFIX = 'aicard:run:'

export function saveRunState(state: RunState): void {
    if (typeof localStorage === 'undefined') return
    localStorage.setItem(RUN_STATE_PREFIX + state.runId, JSON.stringify(state))
}

// Return the most recently started run for the given recipe name, or null.
export function loadRunState(recipeName: string): RunState | null {
    if (typeof localStorage === 'undefined') return null
    let latest: RunState | null = null
    let latestTimestamp = -1
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith(RUN_STATE_PREFIX)) continue
        try {
            const raw = localStorage.getItem(key)
            if (!raw) continue
            const state = JSON.parse(raw) as RunState
            if (state.recipeName !== recipeName) continue
            // runId format: "${recipeName}:${Date.now()}" — timestamp is the last segment
            const timestamp = parseInt(state.runId.split(':').pop() ?? '0', 10)
            if (isNaN(timestamp) || timestamp <= latestTimestamp) continue
            latest = state
            latestTimestamp = timestamp
        } catch {
            // ignore corrupt entries
        }
    }
    return latest
}

// Remove one specific run from localStorage, identified by its runId.
// Use this for "Start fresh" — the user wants to discard just this paused run,
// not every run with the same recipe name.
export function clearRunState(runId: string): void {
    if (typeof localStorage === 'undefined') return
    localStorage.removeItem(RUN_STATE_PREFIX + runId)
}

// Remove all saved run states for the given recipe name.
// Use this before starting a new run and after clean completion — in both cases
// there is no prior state worth recovering.
export function clearAllRunStates(recipeName: string): void {
    if (typeof localStorage === 'undefined') return
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i)
        if (!key?.startsWith(RUN_STATE_PREFIX)) continue
        try {
            const raw = localStorage.getItem(key)
            if (!raw) continue
            const state = JSON.parse(raw) as RunState
            if (state.recipeName === recipeName) toRemove.push(key)
        } catch {
            toRemove.push(key) // remove corrupt entries too
        }
    }
    for (const key of toRemove) {
        localStorage.removeItem(key)
    }
}
