// The Wait card: pauses the recipe for a set amount of time.
//
// TRADE-OFF: The Wait card requires the browser tab to stay open.
// A future version will use a lightweight local service (see docs/kitchen-counter.md).
// For v1, we make this limitation visible to the user before they start a recipe
// with a Wait step. The UI shows a persistent "recipe running" banner.

import type { CardConfig, CardResult, EquipmentCheck, Kitchen, RecipeContext } from '../types.ts'
import type { CardExecutor, OnInteraction } from './card-executor.ts'

export const waitExecutor: CardExecutor = {
  type: 'wait',

  checkEquipment(_kitchen: Kitchen, _config: CardConfig): EquipmentCheck {
    // Wait needs no equipment
    return { ready: true, missing: [] }
  },

  async execute(
    config: CardConfig,
    _context: RecipeContext,
    _kitchen: Kitchen,
    _onInteraction?: OnInteraction
  ): Promise<CardResult> {
    const duration = config['how long'] ?? '0'
    const ms = parseDurationToMs(duration)

    if (ms === 0) {
      return {
        success: false,
        output: {},
        message: `Couldn't understand the wait duration: "${duration}". Try something like "3 days" or "1 hour".`,
      }
    }

    await sleep(ms)

    return {
      success: true,
      output: { waited: duration },
      message: `Waited ${duration}.`,
    }
  },

  describe(config: CardConfig): string {
    const duration = config['how long'] ?? 'some time'
    return `Waiting ${duration}...`
  },
}

// Parse a plain-English duration string into milliseconds.
// Handles: "3 days", "1 hour", "30 minutes", "5 seconds"
function parseDurationToMs(duration: string): number {
  const match = duration.trim().match(/^(\d+(?:\.\d+)?)\s*(second|seconds|minute|minutes|hour|hours|day|days)$/i)
  if (!match) return 0

  const value = parseFloat(match[1])
  const unit = match[2].toLowerCase()

  const multipliers: Record<string, number> = {
    second: 1000,
    seconds: 1000,
    minute: 60 * 1000,
    minutes: 60 * 1000,
    hour: 60 * 60 * 1000,
    hours: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000,
    days: 24 * 60 * 60 * 1000,
  }

  return value * (multipliers[unit] ?? 0)
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
