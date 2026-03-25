// StepItem: renders a single step in the recipe timeline.
import type { RecipeStep } from '../types.ts'
import type { StepState } from '../runner/recipe-runner.ts'
import type { PendingInteraction } from './hooks/use-recipe-interaction.ts'
import CardConfig from './CardConfig.tsx'
import StepInteraction from './StepInteraction.tsx'
import styles from './RecipeView.module.css'

const CARD_LABELS: Record<string, string> = {
  listen: 'Listen',
  wait: 'Wait',
  'send-message': 'Send Message',
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

interface Props {
  step: RecipeStep
  index: number
  stepRunState?: StepState
  isEditing: boolean
  isRunning: boolean
  reviewingStepIndex: number | null
  pendingInteraction: PendingInteraction | null
  onTweakOpen: (index: number) => void
  onConfigSave: (index: number, config: Record<string, string>) => void
  onConfigCancel: (index: number) => void
  onReviewConfirm: () => void
  onReviewTweakOpen: (index: number) => void
  onInteractionSubmit: (values: Record<string, string>) => void
}

export default function StepItem({
  step, index, stepRunState, isEditing, isRunning,
  reviewingStepIndex, pendingInteraction,
  onTweakOpen, onConfigSave, onConfigCancel,
  onReviewConfirm, onReviewTweakOpen, onInteractionSubmit,
}: Props) {
  const status = stepRunState?.status ?? 'pending'
  const isCardStep = 'card' in step

  return (
    <li
      className={styles.stepItem}
      style={{ animationDelay: `${index * 60}ms` }}
      aria-label={`Step ${step.number}: ${step.name}, ${status}`}
    >
      <div
        className={stepCardClass(status)}
        data-card-type={isCardStep ? step.card : undefined}
      >
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
              <span className={styles.cardBadge}>{CARD_LABELS[step.card] ?? step.card}</span>
            )}
            {'recipe' in step && (
              <span className={styles.subRecipeBadge}>Sub-recipe</span>
            )}
            {isCardStep && !isEditing && (status === 'pending' || !isRunning) && (
              <button
                className={styles.tweakButton}
                onClick={() => onTweakOpen(index)}
              >
                Tweak
              </button>
            )}
          </div>

          {stepRunState?.description && (
            <p className={styles.stepDescription}>{stepRunState.description}</p>
          )}

          {stepRunState?.result && (
            <p className={stepRunState.result.success
              ? `${styles.stepResult} ${styles.stepResultSuccess}`
              : `${styles.stepResult} ${styles.stepResultFailed}`
            }>
              {stepRunState.result.message}
            </p>
          )}

          {reviewingStepIndex === index && !isEditing && (
            <div className={styles.reviewPanel} role="status">
              <span className={styles.reviewText}>
                Review this step before it runs, or wait for it to start automatically.
              </span>
              <div className={styles.reviewActions}>
                <button
                  className={styles.tweakButton}
                  onClick={() => onReviewTweakOpen(index)}
                >
                  Tweak
                </button>
                <button
                  className={styles.reviewConfirmButton}
                  onClick={onReviewConfirm}
                >
                  Run this step
                </button>
              </div>
            </div>
          )}

          {pendingInteraction?.stepIndex === index && (
            <StepInteraction
              interaction={pendingInteraction.interaction}
              onSubmit={onInteractionSubmit}
            />
          )}

          {isEditing && isCardStep && (
            <CardConfig
              step={step}
              onSave={config => onConfigSave(index, config)}
              onCancel={() => onConfigCancel(index)}
            />
          )}
        </div>
      </div>
    </li>
  )
}
