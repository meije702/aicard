// use-tour-position: calculates popover placement relative to a tour target.
// Two separate concerns:
//   1. Scroll target into view — only when the stop changes (not on every scroll)
//   2. Recalculate position — on scroll and resize (pure measurement, no side effects)

import { useState, useEffect, useCallback, useRef } from 'react'

export interface TourPosition {
  /** Bounding rect of the target element (for spotlight) */
  targetRect: DOMRect | null
  /** CSS top for the popover */
  top: number
  /** CSS left for the popover */
  left: number
  /** Arrow points up (popover below target) or down (popover above) */
  arrowDirection: 'up' | 'down'
  /** Whether the target was found */
  found: boolean
}

const POPOVER_WIDTH = 340
const POPOVER_HEIGHT_ESTIMATE = 200  // rough max height
const SPOTLIGHT_PADDING = 8
const POPOVER_GAP = 12

export function useTourPosition(targetSelector: string): TourPosition {
  const [position, setPosition] = useState<TourPosition>({
    targetRect: null, top: 0, left: 0, arrowDirection: 'up', found: false,
  })

  // Track whether we've already scrolled for this selector
  const scrolledForRef = useRef<string | null>(null)

  // Pure measurement — no scrolling, no side effects.
  // Safe to call on every scroll/resize without creating loops.
  const measure = useCallback(() => {
    const el = document.querySelector(`[data-tour="${targetSelector}"]`)
    if (!el) {
      setPosition(prev => prev.found === false ? prev : { ...prev, found: false, targetRect: null })
      return
    }

    const rect = el.getBoundingClientRect()
    const viewportHeight = window.innerHeight
    const viewportWidth = window.innerWidth

    // Decide: below or above?
    const spaceBelow = viewportHeight - rect.bottom - SPOTLIGHT_PADDING
    const spaceAbove = rect.top - SPOTLIGHT_PADDING
    const placeBelow = spaceBelow >= POPOVER_HEIGHT_ESTIMATE || spaceBelow > spaceAbove

    let top: number
    let arrowDirection: 'up' | 'down'

    if (placeBelow) {
      top = rect.bottom + SPOTLIGHT_PADDING + POPOVER_GAP
      arrowDirection = 'up'
    } else {
      top = rect.top - SPOTLIGHT_PADDING - POPOVER_GAP - POPOVER_HEIGHT_ESTIMATE
      arrowDirection = 'down'
    }

    // Horizontal: center on target, clamp to viewport
    let left = rect.left + rect.width / 2 - POPOVER_WIDTH / 2
    left = Math.max(12, Math.min(left, viewportWidth - POPOVER_WIDTH - 12))

    // Clamp top
    top = Math.max(12, Math.min(top, viewportHeight - POPOVER_HEIGHT_ESTIMATE - 12))

    setPosition({ targetRect: rect, top, left, arrowDirection, found: true })
  }, [targetSelector])

  // Scroll into view — only when the target selector changes (stop navigation).
  // After scrolling, wait for the animation to settle, then measure.
  useEffect(() => {
    if (scrolledForRef.current === targetSelector) return
    scrolledForRef.current = targetSelector

    const el = document.querySelector(`[data-tour="${targetSelector}"]`)
    if (!el) {
      measure()
      return
    }

    // Check if already in viewport
    const rect = el.getBoundingClientRect()
    const inViewport = rect.top >= 0 && rect.bottom <= window.innerHeight

    if (!inViewport) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      // Measure after the scroll animation settles (~400ms for smooth scroll)
      const timer = setTimeout(measure, 400)
      return () => clearTimeout(timer)
    }

    // Already visible — measure immediately
    measure()
  }, [targetSelector, measure])

  // Recalculate on scroll and resize — pure measurement only, no scrolling.
  useEffect(() => {
    window.addEventListener('scroll', measure, { passive: true })
    window.addEventListener('resize', measure, { passive: true })

    return () => {
      window.removeEventListener('scroll', measure)
      window.removeEventListener('resize', measure)
    }
  }, [measure])

  return position
}
