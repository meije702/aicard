// First-run flags persisted to localStorage.
// Used to show one-time guidance (the recipe tour) exactly once for a new user.

const TOUR_SEEN_KEY = 'aicard:tour-seen'

export function hasSeenTour(): boolean {
  try {
    return localStorage.getItem(TOUR_SEEN_KEY) === 'true'
  } catch {
    // TRADE-OFF: if storage is unavailable, treat the tour as already seen so we
    // never trap the user in a tour that re-opens on every recipe.
    return true
  }
}

export function markTourSeen(): void {
  try {
    localStorage.setItem(TOUR_SEEN_KEY, 'true')
  } catch {
    // Best-effort — if we can't persist, the tour may show again next session.
  }
}
