// TourPopover: the explanation popover anchored near a tour target.
// Shows title, markdown body, progress dots, and navigation buttons.

import MarkdownText from '../MarkdownText.tsx'
import styles from './tour.module.css'

interface Props {
  title: string
  body: string
  top: number
  left: number
  arrowDirection: 'up' | 'down'
  currentStop: number
  totalStops: number
  loading: boolean
  onBack: () => void
  onNext: () => void
  onClose: () => void
}

export default function TourPopover({
  title, body, top, left, arrowDirection,
  currentStop, totalStops, loading,
  onBack, onNext, onClose,
}: Props) {
  const isFirst = currentStop === 0
  const isLast = currentStop === totalStops - 1

  return (
    <div
      className={styles.popover}
      style={{ top, left }}
      role="dialog"
      aria-label={`Tour: ${title}`}
      aria-modal="false"
    >
      {/* Arrow */}
      <div className={`${styles.arrow} ${arrowDirection === 'up' ? styles.arrowUp : styles.arrowDown}`} />

      {loading ? (
        <div className={styles.loading}>Loading…</div>
      ) : (
        <>
          <div className={styles.title}>{title}</div>
          <MarkdownText text={body} className={styles.body} />
        </>
      )}

      {/* Navigation */}
      <div className={styles.nav}>
        {!isFirst && (
          <button className={styles.navButton} onClick={onBack} disabled={loading}>
            ← Back
          </button>
        )}

        {/* Progress dots */}
        <div className={styles.progress}>
          {Array.from({ length: totalStops }, (_, i) => {
            let cls = styles.dot
            if (i < currentStop) cls += ' ' + styles.dotComplete
            else if (i === currentStop) cls += ' ' + styles.dotActive
            return <div key={i} className={cls} />
          })}
        </div>

        {isLast ? (
          <button className={styles.nextButton} onClick={onClose}>
            Done
          </button>
        ) : (
          <button className={styles.nextButton} onClick={onNext} disabled={loading}>
            Next →
          </button>
        )}
      </div>
    </div>
  )
}
