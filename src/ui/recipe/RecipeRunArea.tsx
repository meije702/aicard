// RecipeRunArea — run/stop button, readiness hints, and completion banner.

import type { ReadinessBlocker } from '../../runner/recipe-runner.ts'
import styles from '../RecipeView.module.css'

export default function RecipeRunArea({
  isRunning,
  isPaused,
  isComplete,
  ready,
  equipmentBlockers,
  cardTypeBlockers,
  onRun,
  onStop,
}: {
  isRunning: boolean
  isPaused: boolean
  isComplete: boolean
  ready: boolean
  equipmentBlockers: ReadinessBlocker[]
  cardTypeBlockers: ReadinessBlocker[]
  onRun: () => void
  onStop: () => void
}) {
  return (
    <div className={styles.runArea} aria-live="polite" data-tour="run-area">
      {isRunning ? (
        <button type="button" className={styles.stopButton} onClick={onStop} aria-label="Stop recipe">
          Stop
        </button>
      ) : !isPaused ? (
        <button type="button"
          className={styles.runButton}
          onClick={onRun}
          disabled={!ready}
          aria-label="Run recipe"
        >
          Run recipe
        </button>
      ) : null}

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

      {isComplete && !isRunning && (
        <div className={styles.completionBanner}>
          Recipe complete ✓
        </div>
      )}
    </div>
  )
}
