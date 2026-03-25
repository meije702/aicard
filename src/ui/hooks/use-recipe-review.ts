// Manages the pre-step review window: which step is being reviewed,
// the auto-advance timer, and the resolve callback for the runner.

import { useState, useRef } from 'react'

export function useRecipeReview() {
  const [reviewingStepIndex, setReviewingStepIndex] = useState<number | null>(null)
  const reviewResolveRef = useRef<(() => void) | null>(null)

  function handleReviewConfirm() {
    const ref = reviewResolveRef as unknown as { timerId?: ReturnType<typeof setTimeout> }
    if (ref.timerId) {
      clearTimeout(ref.timerId)
      ref.timerId = undefined
    }
    if (reviewResolveRef.current) {
      reviewResolveRef.current()
      reviewResolveRef.current = null
    }
    setReviewingStepIndex(null)
  }

  // Creates the onPreStepReview callback for the runner.
  // Shows the review panel and auto-advances after 5s.
  function createReviewCallback(stepIndex: number): Promise<void> {
    return new Promise<void>((resolve) => {
      reviewResolveRef.current = resolve
      setReviewingStepIndex(stepIndex)
      const timer = setTimeout(() => {
        reviewResolveRef.current = null
        setReviewingStepIndex(null)
        resolve()
      }, 5000)
      ;(reviewResolveRef as unknown as { timerId?: ReturnType<typeof setTimeout> }).timerId = timer
    })
  }

  // Clears the auto-advance timer without confirming (for when user opens tweak editor)
  function clearReviewTimer() {
    const ref = reviewResolveRef as unknown as { timerId?: ReturnType<typeof setTimeout> }
    if (ref.timerId !== undefined) {
      clearTimeout(ref.timerId)
      ref.timerId = undefined
    }
  }

  return {
    reviewingStepIndex,
    setReviewingStepIndex,
    reviewResolveRef,
    handleReviewConfirm,
    createReviewCallback,
    clearReviewTimer,
  }
}
