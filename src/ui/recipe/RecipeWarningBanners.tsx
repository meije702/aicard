// RecipeWarningBanners — wait-step warning and paused-recipe recovery banner.

import type { RunState } from '../../runner/recipe-runner.ts'
import styles from '../RecipeView.module.css'

export default function RecipeWarningBanners({
  hasWaitSteps,
  isRunning,
  isPaused,
  runState,
  ready,
  onResume,
  onStartFresh,
}: {
  hasWaitSteps: boolean
  isRunning: boolean
  isPaused: boolean
  runState: RunState | null
  ready: boolean
  onResume: () => void
  onStartFresh: () => void
}) {
  return (
    <>
      {hasWaitSteps && isRunning && (
        <div className={styles.warningBanner} role="status">
          <strong>Keep this tab open.</strong> This recipe has a Wait step.
          Closing the tab will pause the recipe.
        </div>
      )}

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
              <span className={styles.pausedDetail}>
                Resume where you left off, or start over.
              </span>
            </div>
          </div>
          <div className={styles.pausedActions}>
            <button className={styles.resumeButton} onClick={onResume} disabled={!ready}>
              Resume
            </button>
            <button className={styles.startFreshButton} onClick={onStartFresh}>
              Start fresh
            </button>
          </div>
        </div>
      )}
    </>
  )
}
