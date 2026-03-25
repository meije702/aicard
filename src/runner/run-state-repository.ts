// Persistence for recipe run state.
// Extracted from recipe-runner.ts to honour the Single Responsibility Principle:
// the runner orchestrates steps; this module owns the localStorage contract.

import type { RunState } from './recipe-runner.ts'

// Abstraction over the storage mechanism — makes the runner testable without
// a browser environment and lets alternative backends be swapped in.
export interface RunStateRepository {
  save(state: RunState): void
  load(recipeName: string): RunState | null
  clear(runId: string): void
  clearAll(recipeName: string): void
}

const RUN_STATE_PREFIX = 'aicard:run:'

// The production implementation backed by window.localStorage.
// All methods are no-ops when localStorage is unavailable (e.g. during tests).
export const localStorageRunStateRepository: RunStateRepository = {
  // Persist run state so a mid-run tab close can be recovered.
  // Keyed by runId (not recipeName) so two recipes with the same name never
  // overwrite each other. load() scans for the most recent matching entry.
  save(state: RunState): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.setItem(RUN_STATE_PREFIX + state.runId, JSON.stringify(state))
    } catch (e) {
      console.warn('Failed to save run state:', e)
    }
  },

  // Return the most recently started run for the given recipe name, or null.
  load(recipeName: string): RunState | null {
    if (typeof localStorage === 'undefined') return null
    let latest: RunState | null = null
    let latestTimestamp = -1
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(RUN_STATE_PREFIX)) continue
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const state = JSON.parse(raw) as RunState
        if (state.recipeName !== recipeName) continue
        // runId format: "${recipeName}:${Date.now()}" — timestamp is the last segment
        const timestamp = parseInt(state.runId.split(':').pop() ?? '0', 10)
        if (isNaN(timestamp) || timestamp <= latestTimestamp) continue
        latest = state
        latestTimestamp = timestamp
      } catch {
        // ignore corrupt entries
      }
    }
    return latest
  },

  // Remove one specific run from localStorage, identified by its runId.
  // Use this for "Start fresh" — the user wants to discard just this paused run,
  // not every run with the same recipe name.
  clear(runId: string): void {
    if (typeof localStorage === 'undefined') return
    try {
      localStorage.removeItem(RUN_STATE_PREFIX + runId)
    } catch (e) {
      console.warn('Failed to clear run state:', e)
    }
  },

  // Remove all saved run states for the given recipe name.
  // Use this before starting a new run and after clean completion — in both cases
  // there is no prior state worth recovering.
  clearAll(recipeName: string): void {
    if (typeof localStorage === 'undefined') return
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (!key?.startsWith(RUN_STATE_PREFIX)) continue
      try {
        const raw = localStorage.getItem(key)
        if (!raw) continue
        const state = JSON.parse(raw) as RunState
        if (state.recipeName === recipeName) toRemove.push(key)
      } catch {
        toRemove.push(key) // remove corrupt entries too
      }
    }
    for (const key of toRemove) {
      try { localStorage.removeItem(key) } catch { /* best-effort cleanup */ }
    }
  },
}
