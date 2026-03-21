// Tests for the recipe runner's Level 2 behaviour: getStepConfig overrides.
//
// These tests focus on the runner's ability to pick up config tweaked by the
// user after a run starts. The runner should use liveConfig when provided and
// fall back to the recipe's original config when getStepConfig returns null.

import { assertEquals } from 'jsr:@std/assert'
import { runRecipe } from './recipe-runner.ts'
import type { Recipe, Kitchen } from '../types.ts'

// A minimal recipe with a single Wait step using a long duration
const waitRecipe: Recipe = {
  name: 'Test Wait Recipe',
  purpose: '',
  kitchen: [],
  steps: [
    {
      number: 1,
      name: 'Wait a long time',
      card: 'wait',
      config: { 'how long': '999 days' },  // would hang forever if used
    },
  ],
  errors: [],
}

const emptyKitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }

Deno.test('runRecipe: getStepConfig overrides recipe config when provided', async () => {
  const start = Date.now()

  const finalState = await runRecipe(
    waitRecipe,
    emptyKitchen,
    undefined,
    undefined,
    // Level 2: override the Wait duration to 1ms so the test completes instantly
    (_stepIndex) => ({ 'how long': '1 second' })
  )

  const elapsed = Date.now() - start

  assertEquals(finalState.complete, true)
  assertEquals(finalState.steps[0].status, 'complete')
  // Should complete in well under 5s (used 1s wait, not 999 days)
  assertEquals(elapsed < 5000, true)
})

Deno.test('runRecipe: falls back to recipe config when getStepConfig returns null', async () => {
  // Use a valid short duration in the recipe itself
  const shortRecipe: Recipe = {
    name: 'Short Wait',
    purpose: '',
    kitchen: [],
    steps: [
      {
        number: 1,
        name: 'Wait a moment',
        card: 'wait',
        config: { 'how long': '1 second' },
      },
    ],
    errors: [],
  }

  const finalState = await runRecipe(
    shortRecipe,
    emptyKitchen,
    undefined,
    undefined,
    // Return null → runner should use recipe's original '1 second' config
    (_stepIndex) => null
  )

  assertEquals(finalState.complete, true)
  assertEquals(finalState.steps[0].status, 'complete')
})

Deno.test('runRecipe: getStepConfig receives correct step index', async () => {
  const receivedIndices: number[] = []

  const twoStepRecipe: Recipe = {
    name: 'Two Step',
    purpose: '',
    kitchen: [],
    steps: [
      { number: 1, name: 'First wait', card: 'wait', config: { 'how long': '1 second' } },
      { number: 2, name: 'Second wait', card: 'wait', config: { 'how long': '1 second' } },
    ],
    errors: [],
  }

  await runRecipe(
    twoStepRecipe,
    emptyKitchen,
    undefined,
    undefined,
    (stepIndex) => {
      receivedIndices.push(stepIndex)
      return null
    }
  )

  assertEquals(receivedIndices, [0, 1])
})

Deno.test('runRecipe: tweaked description is reflected in step state', async () => {
  const stateDescriptions: string[] = []

  await runRecipe(
    waitRecipe,
    emptyKitchen,
    (state) => {
      const step = state.steps[0]
      if (step.description && !stateDescriptions.includes(step.description)) {
        stateDescriptions.push(step.description)
      }
    },
    undefined,
    // Override: 1 second instead of 999 days
    (_stepIndex) => ({ 'how long': '1 second' })
  )

  // The description should eventually reflect "1 second", not "999 days"
  const finalDescription = stateDescriptions[stateDescriptions.length - 1] ?? ''
  assertEquals(finalDescription.includes('1 second'), true)
})
