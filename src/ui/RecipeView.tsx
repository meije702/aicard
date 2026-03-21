// RecipeView: reading and running a recipe.
// This is what Maria sees after she opens a recipe file.
// A beautiful step-by-step tracker with a vertical timeline.

import { useState, useEffect, useCallback, useRef } from 'react'
import type { Recipe, Kitchen as KitchenType } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import type { StepInteraction as StepInteractionType } from '../cards/card-executor.ts'
import { runRecipe } from '../runner/recipe-runner.ts'
import { checkRecipeReadiness, recipeHasWaitSteps } from '../runner/recipe-readiness.ts'
import {
  localStorageRunStateRepository as runStateRepo,
} from '../runner/run-state-repository.ts'
// GetStepConfig is used to pass live config overrides to the runner
import CardConfig from './CardConfig.tsx'
import StepInteraction from './StepInteraction.tsx'
import styles from './RecipeView.module.css'

interface Props {
  recipe: Recipe
  kitchen: KitchenType
  onBack: () => void
  onConnectEquipment: (name: string) => void
  onRunStateChange?: (state: RunState | null) => void
}

function equipmentIcon(name: string): string {
  const n = name.toLowerCase()
  if (n.includes('shopify') || n.includes('shop')) return '🛍'
  if (n.includes('gmail') || n.includes('email') || n.includes('mail')) return '✉️'
  if (n.includes('discord')) return '💬'
  if (n.includes('slack')) return '💬'
  if (n.includes('calendar')) return '📅'
  return '🔌'
}

// Pending interaction: tracks which step is waiting for user input and
// holds the resolve function so the executor's Promise can be fulfilled.
interface PendingInteraction {
  stepIndex: number
  interaction: StepInteractionType
  resolve: (values: Record<string, string>) => void
}

export default function RecipeView({ recipe, kitchen, onBack, onConnectEquipment, onRunStateChange }: Props) {
  // Hydrate from localStorage — if this recipe was mid-run when the tab closed,
  // we show the last known state and offer to restart or start fresh.
  const [runState, setRunState] = useState<RunState | null>(() => runStateRepo.load(recipe.name))
  const [isRunning, setIsRunning] = useState(false)
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipe)
  const [pendingInteraction, setPendingInteraction] = useState<PendingInteraction | null>(null)
  // Ref to hold the latest pending interaction resolve fn so it survives re-renders
  const interactionResolveRef = useRef<((values: Record<string, string>) => void) | null>(null)
  // Ref that always holds the current recipe — updated synchronously in
  // handleConfigSave so the runner sees tweaked configs immediately, without
  // waiting for the async React state update to flush.
  const activeRecipeRef = useRef<typeof activeRecipe>(activeRecipe)

  // A run is "paused" if we have a saved state that wasn't completed cleanly.
  const isPaused = runState !== null && !runState.complete && !isRunning

  // Notify the parent (App) whenever run state changes so SousChef can use it
  useEffect(() => {
    onRunStateChange?.(runState)
  }, [runState, onRunStateChange])

  const { ready, blockers } = checkRecipeReadiness(activeRecipe, kitchen)
  const equipmentBlockers = blockers.filter(b => b.kind === 'equipment')
  const cardTypeBlockers = blockers.filter(b => b.kind === 'card-type')
  const hasWaitSteps = recipeHasWaitSteps(activeRecipe)

  function handleStartFresh() {
    // Clear only this specific paused run, not siblings with the same name.
    if (runState) runStateRepo.clear(runState.runId)
    setRunState(null)
  }

  // Handle user submitting an interaction form (e.g., confirming a new order)
  const handleInteractionSubmit = useCallback((values: Record<string, string>) => {
    if (interactionResolveRef.current) {
      interactionResolveRef.current(values)
      interactionResolveRef.current = null
    }
    setPendingInteraction(null)
  }, [])

  async function handleRun() {
    // Before starting, wipe all prior runs for this recipe — none are worth recovering.
    runStateRepo.clearAll(activeRecipe.name)
    setIsRunning(true)
    setRunState(null)
    setPendingInteraction(null)

    const finalState = await runRecipe(
      activeRecipe,
      kitchen,
      (state) => {
        setRunState({ ...state })
        // Persist after every step so a tab close doesn't lose progress
        runStateRepo.save(state)
      },
      // Interaction callback: when an executor needs user input, we surface
      // the request as a form inside the step card and wait for submission.
      (stepIndex, interaction) => {
        return new Promise<Record<string, string>>((resolve) => {
          interactionResolveRef.current = resolve
          setPendingInteraction({ stepIndex, interaction, resolve })
        })
      },
      // Level 2: supply live config for each step just before it runs,
      // picking up any tweaks the user made to pending steps mid-run.
      (stepIndex) => {
        const step = activeRecipeRef.current.steps[stepIndex]
        return ('card' in step) ? step.config : null
      }
    )
    setRunState(finalState)
    setIsRunning(false)
    setPendingInteraction(null)
    // Clear once cleanly complete — no recovery needed
    if (finalState.complete) {
      runStateRepo.clearAll(activeRecipe.name)
    }
  }

  function handleConfigSave(stepIndex: number, newConfig: Record<string, string>) {
    const updatedSteps = activeRecipe.steps.map((step, i) => {
      if (i !== stepIndex) return step
      if ('card' in step) return { ...step, config: newConfig }
      return step
    })
    const updatedRecipe = { ...activeRecipe, steps: updatedSteps }
    // Update the ref immediately so the runner picks up the new config
    // before React's async state update has flushed.
    activeRecipeRef.current = updatedRecipe
    setActiveRecipe(updatedRecipe)
    setEditingStepIndex(null)
  }

  function stepNumberClass(status: string): string {
    switch (status) {
      case 'running':  return styles.stepNumberRunning
      case 'complete': return styles.stepNumberComplete
      case 'failed':   return styles.stepNumberFailed
      default:         return styles.stepNumberPending
    }
  }

  function stepCardClass(status: string): string {
    switch (status) {
      case 'running':  return `${styles.stepCard} ${styles.stepCardRunning}`
      case 'complete': return `${styles.stepCard} ${styles.stepCardComplete}`
      case 'failed':   return `${styles.stepCard} ${styles.stepCardFailed}`
      default:         return styles.stepCard
    }
  }

  function statusIcon(status: string): string {
    switch (status) {
      case 'running':  return '…'
      case 'complete': return '✓'
      case 'failed':   return '!'
      default:         return ''
    }
  }

  return (
    <div className={styles.container}>
      {/* Back button */}
      <button className={styles.backButton} onClick={onBack} aria-label="Back to kitchen">
        <span className={styles.backArrow} aria-hidden="true">←</span>
        Back to kitchen
      </button>

      {/* Recipe header */}
      <header className={styles.header}>
        <h1 className={styles.recipeName}>
          {activeRecipe.name || 'Untitled Recipe'}
        </h1>
        {activeRecipe.purpose && (
          <p className={styles.recipePurpose}>{activeRecipe.purpose}</p>
        )}
      </header>

      {/* Parse errors */}
      {activeRecipe.errors.length > 0 && (
        <div className={styles.errorBanner} role="alert">
          <div className={styles.errorTitle}>This recipe has some problems</div>
          <ul className={styles.errorList}>
            {activeRecipe.errors.map((err, i) => (
              <li key={i} className={styles.errorItem}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Equipment check */}
      {activeRecipe.kitchen.length > 0 && (
        <div className={styles.equipmentCard}>
          <div className={styles.sectionLabel}>Equipment</div>
          {activeRecipe.kitchen.map(name => {
            const connected = kitchen.equipment.some(
              e => e.name.toLowerCase() === name.toLowerCase() && e.connected
            )
            return (
              <div key={name} className={styles.equipmentRow}>
                <div className={styles.equipmentIcon} aria-hidden="true">
                  {equipmentIcon(name)}
                </div>
                <span className={styles.equipmentName}>{name}</span>
                {connected ? (
                  <span className={styles.equipmentConnected}>
                    <span className={styles.statusDot} aria-hidden="true" />
                    Connected
                  </span>
                ) : (
                  <button
                    className={styles.connectButton}
                    onClick={() => onConnectEquipment(name)}
                  >
                    Connect
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* Wait step warning */}
      {hasWaitSteps && !isPaused && (
        <div className={styles.warningBanner} role="status">
          <strong>Keep this tab open.</strong> This recipe has a Wait step.
          Closing the tab will pause the recipe.
        </div>
      )}

      {/* Recovery banner — shown when we loaded a mid-run state from localStorage */}
      {isPaused && runState && (
        <div className={styles.pausedBanner} role="status">
          <div className={styles.pausedBannerContent}>
            <span className={styles.pausedIcon} aria-hidden="true">⏸</span>
            <div className={styles.pausedText}>
              <strong>This recipe was paused when the tab closed.</strong>
              <span className={styles.pausedDetail}>
                {(() => {
                  const lastDone = [...runState.steps].reverse().find(
                    s => s.status === 'complete' || s.status === 'failed' || s.status === 'skipped'
                  )
                  return lastDone
                    ? `Last completed: step ${lastDone.number} — ${lastDone.name}`
                    : 'No steps had finished yet.'
                })()}
              </span>
            </div>
          </div>
          <button className={styles.startFreshButton} onClick={handleStartFresh}>
            Start fresh
          </button>
        </div>
      )}

      {/* Steps */}
      <div className={styles.stepsCard}>
        <div className={styles.sectionLabel}>Steps</div>
        <ol className={styles.stepsList} aria-label="Recipe steps">
          {activeRecipe.steps.map((step, i) => {
            const stepRunState = runState?.steps[i]
            const status = stepRunState?.status ?? 'pending'
            const isEditing = editingStepIndex === i
            const isCardStep = 'card' in step

            return (
              <li
                key={i}
                className={styles.stepItem}
                style={{ animationDelay: `${i * 60}ms` }}
                aria-label={`Step ${step.number}: ${step.name}, ${status}`}
              >
                <div className={stepCardClass(status)}>
                  {/* Step number */}
                  <div
                    className={`${styles.stepNumber} ${stepNumberClass(status)}`}
                    aria-hidden="true"
                  >
                    {statusIcon(status) || step.number}
                  </div>

                  <div className={styles.stepBody}>
                    <div className={styles.stepHeader}>
                      <span className={styles.stepName}>{step.name}</span>
                      {isCardStep && (
                        <span className={styles.cardBadge}>{step.card}</span>
                      )}
                      {/* Tweak button — visible for pending steps (even mid-run)
                          and for any step when no run is active. Hidden while
                          the step itself is running, complete, or failed. */}
                      {isCardStep && !isEditing && (status === 'pending' || !isRunning) && (
                        <button
                          className={styles.tweakButton}
                          onClick={() => setEditingStepIndex(i)}
                        >
                          Tweak
                        </button>
                      )}
                    </div>

                    {/* Description */}
                    {stepRunState?.description && (
                      <p className={styles.stepDescription}>{stepRunState.description}</p>
                    )}

                    {/* Result */}
                    {stepRunState?.result && (
                      <p className={stepRunState.result.success
                        ? `${styles.stepResult} ${styles.stepResultSuccess}`
                        : `${styles.stepResult} ${styles.stepResultFailed}`
                      }>
                        {stepRunState.result.message}
                      </p>
                    )}

                    {/* Interaction form — shown when a step is waiting for user input */}
                    {pendingInteraction?.stepIndex === i && (
                      <StepInteraction
                        interaction={pendingInteraction.interaction}
                        onSubmit={handleInteractionSubmit}
                      />
                    )}

                    {/* Level 2 config editor */}
                    {isEditing && isCardStep && (
                      <CardConfig
                        step={step}
                        onSave={config => handleConfigSave(i, config)}
                        onCancel={() => setEditingStepIndex(null)}
                      />
                    )}
                  </div>
                </div>
              </li>
            )
          })}
        </ol>
      </div>

      {/* Run area */}
      <div className={styles.runArea} aria-live="polite">
        <button
          className={`${styles.runButton} ${isRunning ? styles.runButtonRunning : ''}`}
          onClick={handleRun}
          disabled={!ready || isRunning}
          aria-label={isRunning ? 'Recipe is running' : 'Run recipe'}
          aria-busy={isRunning}
        >
          {isRunning ? 'Running…' : 'Run recipe'}
        </button>

        {!ready && !isRunning && (
          <div className={styles.runHint}>
            {equipmentBlockers.length > 0 && (
              <p>Connect {equipmentBlockers.map(b => b.label).join(' and ')} to run this recipe.</p>
            )}
            {cardTypeBlockers.length > 0 && (
              <p>
                {cardTypeBlockers.length === 1
                  ? `The "${cardTypeBlockers[0].label}" card isn't in your pantry yet.`
                  : `Cards not in your pantry: ${cardTypeBlockers.map(b => `"${b.label}"`).join(', ')}.`}
              </p>
            )}
          </div>
        )}

        {runState?.complete && !isRunning && (
          <div className={styles.completionBanner}>
            Recipe complete ✓
          </div>
        )}
      </div>
    </div>
  )
}
