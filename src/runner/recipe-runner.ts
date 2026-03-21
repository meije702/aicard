// The recipe runner: orchestrates parser → executors → kitchen state into a running recipe.
// This is the engine. The UI calls it; the sous chef monitors it.
//
// Persistence (save/load/clear run state) lives in run-state-repository.ts.
// Pre-flight readiness checks live in recipe-readiness.ts.

import type {
    Recipe,
    CardStep,
    CardConfig,
    RecipeContext,
    CardResult,
    Kitchen,
} from '../types.ts'
import type { CardExecutor, OnInteraction, StepInteraction } from '../cards/card-executor.ts'
import { listenExecutor } from '../cards/listen.ts'
import { waitExecutor } from '../cards/wait.ts'
import { sendMessageExecutor } from '../cards/send-message.ts'
import { resolveAllValues } from '../cards/resolve-value.ts'

// Replace {step N: key} references in a config with human-readable placeholders
// so initial step descriptions never show raw template syntax to the user.
// e.g. {step 1: customer email} → "the customer email"
function stripStepRefs(config: CardConfig): CardConfig {
    const result: CardConfig = {}
    for (const [k, v] of Object.entries(config)) {
        if (typeof v === 'string') {
            result[k] = v.replace(/\{step\s+\d+:\s*([^}]+)\}/gi, (_match, key: string) => `the ${key.trim()}`)
        } else {
            result[k] = v
        }
    }
    return result
}

// Registry of executors keyed by card type. Injected into runRecipe so tests
// can pass stub executors without touching the production defaults.
export type ExecutorRegistry = Record<string, CardExecutor>

// Production defaults — all card types the system currently supports.
// Import this and pass it to runRecipe; or omit it to use the default.
export const defaultExecutors: ExecutorRegistry = {
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
    // Set when a step is waiting for user input via the interaction callback
    pendingInteraction?: StepInteraction
}

export interface RunState {
    runId: string           // unique run identity — prevents same-name recipe collisions in localStorage
    recipeName: string
    steps: StepState[]
    context: RecipeContext
    complete: boolean
    cancelled?: boolean     // true when the user stopped the run mid-flight
    errors: string[]
}

// Callback fired whenever the run state changes (a step starts, completes, etc.)
export type OnStateChange = (state: RunState) => void

// Callback fired when a step needs user input. The UI renders the interaction
// form; when the user submits, the returned Promise resolves with their values.
export type OnStepInteraction = (
    stepIndex: number,
    interaction: StepInteraction
) => Promise<Record<string, string>>

// Callback the runner calls just before executing each step to pick up any
// config the user tweaked after the run started. Return null to use the
// recipe's original config for that step.
export type GetStepConfig = (stepIndex: number) => CardConfig | null

// Callback invoked before each step starts. Resolves when the user confirms
// (or the review timeout fires) — giving Level 2 users a chance to tweak
// the step before it executes. Omit for Level 1 / test runs.
export type OnStepReview = (stepIndex: number) => Promise<void>

// Run a recipe against the kitchen, calling onStateChange after each step.
// onStepInteraction bridges executor interaction requests to the UI.
// getStepConfig lets the UI supply live config overrides for pending steps.
// isCancelled is polled before each step — return true to abort the run.
// onStepReview is awaited before each step for the pre-step review panel.
// executors defaults to defaultExecutors — inject a stub map in tests to
// avoid hitting real card implementations.
// Returns the final run state.
export async function runRecipe(
    recipe: Recipe,
    kitchen: Kitchen,
    onStateChange?: OnStateChange,
    onStepInteraction?: OnStepInteraction,
    getStepConfig?: GetStepConfig,
    executors: ExecutorRegistry = defaultExecutors,
    isCancelled?: () => boolean,
    onStepReview?: OnStepReview
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
                description: executor?.describe(stripStepRefs(step.config)) ?? `Step: ${step.name}`,
                status: 'pending' as StepStatus,
            }
        }
        // Sub-recipe step — not yet supported in v1
        return {
            number: step.number,
            name: step.name,
            description: `Sub-recipe "${(step as { recipe: string }).recipe}" — not yet supported`,
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

        // Check for user-requested cancellation before each step
        if (isCancelled?.()) {
            state.cancelled = true
            onStateChange?.({ ...state, steps: [...steps] })
            break
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

        // Give the user a chance to review / tweak the step before it runs.
        // onStepReview resolves when the user confirms or the timeout fires.
        if (onStepReview) {
            await onStepReview(i)
            // Re-check cancellation after the review window closes
            if (isCancelled?.()) {
                state.cancelled = true
                onStateChange?.({ ...state, steps: [...steps] })
                break
            }
        }

        // Mark as running
        stepState.status = 'running'
        onStateChange?.({ ...state, steps: [...steps] })

        // Pick up any config the user tweaked after the run started.
        // getStepConfig returns null if the step wasn't tweaked, in which case
        // we fall back to the recipe's original config.
        const liveConfig: CardConfig = getStepConfig?.(i) ?? cardStep.config

        // If the config changed, update the description so the timeline
        // reflects what will actually run (e.g. "Waiting 1 day..." not "3 days").
        if (liveConfig !== cardStep.config) {
            stepState.description = executor.describe(liveConfig)
            onStateChange?.({ ...state, steps: [...steps] })
        }

        // Resolve step references ({step N: key}) before passing config to the
        // executor. Unresolved references fail the step with a clear error instead
        // of flowing through as literal strings.
        const { resolved: resolvedConfig, errors: resolveErrors } = resolveAllValues(
            liveConfig,
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

        // Update description with resolved values so the UI shows the actual
        // data (e.g. "Sending a message to customer@example.com...") rather
        // than the raw config or a step-ref placeholder.
        stepState.description = executor.describe(resolvedConfig)
        onStateChange?.({ ...state, steps: [...steps] })

        // Build the interaction callback for this step.
        // When the executor calls onInteraction, we update the step state
        // to show the pending interaction, notify the UI, and wait for the
        // user's response.
        const stepInteraction: OnInteraction | undefined = onStepInteraction
            ? async (interaction: StepInteraction) => {
                stepState.pendingInteraction = interaction
                onStateChange?.({ ...state, steps: [...steps] })
                const response = await onStepInteraction(i, interaction)
                stepState.pendingInteraction = undefined
                onStateChange?.({ ...state, steps: [...steps] })
                return response
            }
            : undefined

        try {
            const result = await executor.execute(resolvedConfig, context, kitchen, stepInteraction)
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

    state.complete = !state.cancelled && steps.every(s => s.status === 'complete' || s.status === 'skipped')
    onStateChange?.({ ...state, steps: [...steps] })

    return { ...state, steps: [...steps] }
}
