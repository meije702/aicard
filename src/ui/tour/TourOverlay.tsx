// TourOverlay: dims the page except for the spotlighted target element.
// Uses a positioned div with a massive box-shadow to create the cutout effect.

import styles from './tour.module.css'

interface Props {
  targetRect: DOMRect | null
  onClose: () => void
}

const PADDING = 8

export default function TourOverlay({ targetRect, onClose }: Props) {
  if (!targetRect) return null

  return (
    <>
      {/* Clickable backdrop (transparent, full-screen) to close on click */}
      <div
        className={styles.overlay}
        onClick={onClose}
        style={{ pointerEvents: 'auto' }}
        aria-hidden="true"
      />
      {/* Spotlight cutout */}
      <div
        className={styles.spotlight}
        style={{
          top: targetRect.top - PADDING,
          left: targetRect.left - PADDING,
          width: targetRect.width + PADDING * 2,
          height: targetRect.height + PADDING * 2,
        }}
        aria-hidden="true"
      />
    </>
  )
}
