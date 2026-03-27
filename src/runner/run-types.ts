// Run types — type definitions for recipe execution state and callbacks.
// Extracted from recipe-runner.ts so consumers can import types without
// pulling in the executor implementations.

import type {
    CardConfig,
    RecipeContext,
    CardResult,
} from '../types.ts'
import type { CardExecutor, StepInteraction } from '../cards/card-executor.ts'

// Registry of executors keyed by card type. Injected into runRecipe so tests
// can pass stub executors without touching the production defaults.
export type ExecutorRegistry = Record<string, CardExecutor>

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

// Callback invoked when a sub-recipe step is reached (Level 3 — Combining).
// Receives the recipe name and returns a CardResult. If omitted, sub-recipe
// steps are skipped silently (Level 1/2 backwards-compatible behaviour).
// Implement with createSubRecipeRunner from sub-recipe-runner.ts.
export type OnSubRecipe = (recipeName: string) => Promise<CardResult>
