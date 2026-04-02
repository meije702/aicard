// RecipeView: reading and running a recipe.
// This is what Maria sees after she opens a recipe file.
// A beautiful step-by-step tracker with a vertical timeline.

import { useState, useEffect } from 'react'
import type { Recipe, Kitchen as KitchenType, JournalEntry } from '../types.ts'
import type { RunState } from '../runner/recipe-runner.ts'
import { defaultExecutors } from '../runner/recipe-runner.ts'
import { checkRecipeReadiness, recipeHasWaitSteps } from '../runner/recipe-readiness.ts'
import { useRecipeExecution } from './hooks/use-recipe-execution.ts'
import { useRecipeInteraction } from './hooks/use-recipe-interaction.ts'
import { useRecipeReview } from './hooks/use-recipe-review.ts'
import EquipmentPanel from './EquipmentPanel.tsx'
import StepItem from './StepItem.tsx'
import RecipeWarningBanners from './recipe/RecipeWarningBanners.tsx'
import RecipeRunArea from './recipe/RecipeRunArea.tsx'
import styles from './RecipeView.module.css'

interface Props {
  recipe: Recipe
  kitchen: KitchenType
  onBack: () => void
  onConnectEquipment: (name: string) => void
  onRunStateChange?: (state: RunState | null) => void
  onJournalEntry?: (entry: JournalEntry) => void
}

export default function RecipeView({ recipe, kitchen, onBack, onConnectEquipment, onRunStateChange, onJournalEntry }: Props) {
  const [editingStepIndex, setEditingStepIndex] = useState<number | null>(null)
  const [activeRecipe, setActiveRecipe] = useState<Recipe>(recipe)

  const execution = useRecipeExecution(kitchen, recipe.name)
  const interaction = useRecipeInteraction(activeRecipe, onJournalEntry)
  const review = useRecipeReview()

  // Notify parent whenever run state changes
  useEffect(() => { onRunStateChange?.(execution.runState) }, [execution.runState, onRunStateChange])

  const { ready, blockers } = checkRecipeReadiness(activeRecipe, kitchen)
  const equipmentBlockers = blockers.filter(b => b.kind === 'equipment')
  const cardTypeBlockers = blockers.filter(b => b.kind === 'card-type')
  const hasWaitSteps = recipeHasWaitSteps(activeRecipe)

  async function handleRun() {
    execution.activeRecipeRef.current = activeRecipe
    await execution.handleRun(activeRecipe, {
      onInteraction: interaction.createInteractionCallback,
      onPreStepReview: review.createReviewCallback,
      onJournalEntry,
    }, () => {
      interaction.setPendingInteraction(null)
      review.setReviewingStepIndex(null)
    })
  }

  function handleStop() {
    execution.handleStop(review.reviewResolveRef, review.setReviewingStepIndex)
  }

  function handleConfigSave(stepIndex: number, newConfig: Record<string, string>) {
    const updatedSteps = activeRecipe.steps.map((step, i) => {
      if (i !== stepIndex) return step
      if ('card' in step) return { ...step, config: newConfig }
      return step
    })
    const updatedRecipe = { ...activeRecipe, steps: updatedSteps }
    execution.activeRecipeRef.current = updatedRecipe
    setActiveRecipe(updatedRecipe)

    const step = activeRecipe.steps[stepIndex]
    if (execution.runState && 'card' in step) {
      const freshDescription = defaultExecutors[step.card]?.describe(newConfig) ?? step.card
      execution.tweakedDescriptionsRef.current[stepIndex] = freshDescription
      execution.setRunState(prev => {
        if (!prev) return prev
        const steps = [...prev.steps]
        steps[stepIndex] = { ...steps[stepIndex], description: freshDescription }
        return { ...prev, steps }
      })
    }

    setEditingStepIndex(null)
    if (review.reviewingStepIndex === stepIndex) {
      review.handleReviewConfirm()
    }
  }

  function handleConfigCancel(stepIndex: number) {
    setEditingStepIndex(null)
    if (review.reviewingStepIndex === stepIndex) {
      review.handleReviewConfirm()
    }
  }

  return (
    <div className={styles.container}>
      <button className={styles.backButton} onClick={onBack} aria-label="Back to kitchen">
        <span className={styles.backArrow} aria-hidden="true">←</span>
        Back to kitchen
      </button>

      <header className={styles.header} data-tour="recipe-header">
        <h1 className={styles.recipeName}>{activeRecipe.name || 'Untitled Recipe'}</h1>
        {activeRecipe.purpose && (
          <p className={styles.recipePurpose}>{activeRecipe.purpose}</p>
        )}
      </header>

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

      <EquipmentPanel
        equipmentNames={activeRecipe.kitchen}
        kitchen={kitchen}
        onConnectEquipment={onConnectEquipment}
      />

      <RecipeWarningBanners
        hasWaitSteps={hasWaitSteps}
        isRunning={execution.isRunning}
        isPaused={execution.isPaused}
        runState={execution.runState}
        ready={ready}
        onResume={handleRun}
        onStartFresh={execution.handleStartFresh}
      />

      <div className={styles.stepsCard}>
        <div className={styles.sectionLabel}>Steps</div>
        <ol className={styles.stepsList} aria-label="Recipe steps">
          {activeRecipe.steps.map((step, i) => (
            <StepItem
              key={i}
              step={step}
              index={i}
              stepRunState={execution.runState?.steps[i]}
              isEditing={editingStepIndex === i}
              isRunning={execution.isRunning}
              reviewingStepIndex={review.reviewingStepIndex}
              pendingInteraction={interaction.pendingInteraction}
              pantry={kitchen.pantry}
              onTweakOpen={setEditingStepIndex}
              onConfigSave={handleConfigSave}
              onConfigCancel={handleConfigCancel}
              onReviewConfirm={review.handleReviewConfirm}
              onReviewTweakOpen={(idx) => {
                review.clearReviewTimer()
                setEditingStepIndex(idx)
              }}
              onInteractionSubmit={interaction.handleInteractionSubmit}
            />
          ))}
        </ol>
      </div>

      <RecipeRunArea
        isRunning={execution.isRunning}
        isPaused={execution.isPaused}
        isComplete={!!execution.runState?.complete}
        ready={ready}
        equipmentBlockers={equipmentBlockers}
        cardTypeBlockers={cardTypeBlockers}
        onRun={handleRun}
        onStop={handleStop}
      />
    </div>
  )
}
