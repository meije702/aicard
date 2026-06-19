// Tests for the recipe runner: Level 2 config overrides, cancellation,
// error handling, step references, sub-recipe delegation, and interactions.

import { assertEquals, assertStringIncludes } from '@std/assert'
import { runRecipe } from './recipe-runner.ts'
import type { Recipe, Kitchen } from '../types.ts'
import type { CardExecutor } from '../cards/card-executor.ts'
import type { ExecutorRegistry } from './run-types.ts'

// --- Stub executors (instant, no real delays) ---

const instantWaitExecutor: CardExecutor = {
  type: 'wait',
  checkEquipment: () => ({ ready: true, missing: [] }),
  execute: () => Promise.resolve({ success: true, output: {}, message: 'waited' }),
  describe: (config) => `Waiting ${config['how long'] ?? '...'}`,
}

function createStubExecutor(overrides: Partial<CardExecutor> = {}): CardExecutor {
  return {
    type: 'listen',
    checkEquipment: () => ({ ready: true, missing: [] }),
    execute: () => Promise.resolve({ success: true, output: { data: 'value' }, message: 'done' }),
    describe: (config) => `Stub: ${Object.values(config).join(', ')}`,
    ...overrides,
  }
}

const stubExecutors: ExecutorRegistry = {
  listen: createStubExecutor(),
  wait: instantWaitExecutor,
  'send-message': createStubExecutor({ type: 'send-message' }),
}

// --- Helpers ---

function makeRecipe(overrides: Partial<Recipe> = {}): Recipe {
  return {
    name: 'Test Recipe',
    purpose: '',
    kitchen: [],
    steps: [],
    errors: [],
    ...overrides,
  }
}

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

// --- Cancellation ---

Deno.test('runRecipe: isCancelled stops the run before a step', async () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Step 1', card: 'wait', config: { 'how long': '1 second' } },
    ],
  })
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined,
    stubExecutors,
    () => true, // cancelled immediately
  )
  assertEquals(finalState.cancelled, true)
  assertEquals(finalState.complete, false)
  assertEquals(finalState.steps[0].status, 'pending')
})

Deno.test('runRecipe: isCancelled after onStepReview stops the run', async () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Step 1', card: 'wait', config: { 'how long': '1 second' } },
    ],
  })
  let cancelAfterReview = false
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined,
    stubExecutors,
    () => cancelAfterReview,
    () => { cancelAfterReview = true; return Promise.resolve() }, // review triggers cancel
  )
  assertEquals(finalState.cancelled, true)
  assertEquals(finalState.complete, false)
})

// --- Unknown card type ---

Deno.test('runRecipe: unknown card type fails step but continues to next', async () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Bad step', card: 'transform' as never, config: {} },
      { number: 2, name: 'Good step', card: 'wait', config: { 'how long': '1 second' } },
    ],
  })
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined, stubExecutors,
  )
  assertEquals(finalState.steps[0].status, 'failed')
  assertEquals(finalState.steps[1].status, 'complete')
  assertEquals(finalState.errors.length >= 1, true)
  assertStringIncludes(finalState.errors[0], 'Unknown card type')
})

// --- Executor exception ---

Deno.test('runRecipe: executor exception is caught and step marked failed', async () => {
  const throwingExecutor = createStubExecutor({
    execute: () => Promise.reject(new Error('kaboom')),
  })
  const recipe = makeRecipe({
    steps: [{ number: 1, name: 'Boom', card: 'listen', config: {} }],
  })
  const executors: ExecutorRegistry = { ...stubExecutors, listen: throwingExecutor }
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined, executors,
  )
  assertEquals(finalState.steps[0].status, 'failed')
  assertStringIncludes(finalState.errors[0], 'kaboom')
})

// --- Step references ---

Deno.test('runRecipe: context flows between steps via step references', async () => {
  const listenExec = createStubExecutor({
    execute: () => Promise.resolve({ success: true, output: { email: 'a@b.com' }, message: 'got it' }),
  })
  const sendExec = createStubExecutor({
    type: 'send-message',
    execute: (config) => Promise.resolve({
      success: true,
      output: { to: config['to'] ?? '' },
      message: 'sent',
    }),
  })
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Listen', card: 'listen', config: { 'listen for': 'new order' } },
      { number: 2, name: 'Send', card: 'send-message', config: { to: '{step 1: email}' } },
    ],
  })
  const executors: ExecutorRegistry = { ...stubExecutors, listen: listenExec, 'send-message': sendExec }
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined, executors,
  )
  assertEquals(finalState.complete, true)
  assertEquals(finalState.context['step 2']?.to, 'a@b.com')
})

// --- onStateChange ---

Deno.test('runRecipe: onStateChange called at each transition', async () => {
  let callCount = 0
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Step 1', card: 'wait', config: { 'how long': '1 second' } },
    ],
  })
  await runRecipe(
    recipe, emptyKitchen,
    () => { callCount++ },
    undefined, undefined, stubExecutors,
  )
  // Initial + running + description update + complete + final = at least 4 calls
  assertEquals(callCount >= 4, true)
})

// --- Sub-recipe steps ---

Deno.test('runRecipe: sub-recipe step without onSubRecipe is skipped', async () => {
  const recipe = makeRecipe({
    steps: [{ number: 1, name: 'Call inner', recipe: 'Inner' }],
  })
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined, stubExecutors,
  )
  assertEquals(finalState.steps[0].status, 'skipped')
  assertEquals(finalState.complete, true)
})

Deno.test('runRecipe: sub-recipe step with onSubRecipe success flows to context', async () => {
  const recipe = makeRecipe({
    steps: [{ number: 1, name: 'Call inner', recipe: 'Inner' }],
  })
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined, stubExecutors,
    undefined, undefined,
    () => Promise.resolve({ success: true, output: { result: 'done' }, message: 'ok' }),
  )
  assertEquals(finalState.steps[0].status, 'complete')
  assertEquals(finalState.context['step 1']?.result, 'done')
  assertEquals(finalState.complete, true)
})

Deno.test('runRecipe: sub-recipe failure stops the run', async () => {
  const recipe = makeRecipe({
    steps: [
      { number: 1, name: 'Call inner', recipe: 'Inner' },
      { number: 2, name: 'After', card: 'wait', config: { 'how long': '1 second' } },
    ],
  })
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined, undefined, undefined, stubExecutors,
    undefined, undefined,
    () => Promise.resolve({ success: false, output: {}, message: 'inner failed' }),
  )
  assertEquals(finalState.steps[0].status, 'failed')
  assertEquals(finalState.steps[1].status, 'pending')
  assertEquals(finalState.complete, false)
})

// --- onStepInteraction ---

Deno.test('runRecipe: onStepInteraction bridges interaction to executor', async () => {
  const interactiveExecutor = createStubExecutor({
    execute: async (_config, _ctx, _kitchen, onInteraction) => {
      if (onInteraction) {
        const response = await onInteraction({
          prompt: 'Enter email',
          fields: [{ key: 'email', label: 'Email' }],
        })
        return { success: true, output: response, message: 'got input' }
      }
      return { success: true, output: {}, message: 'no interaction' }
    },
  })
  const recipe = makeRecipe({
    steps: [{ number: 1, name: 'Interactive', card: 'listen', config: {} }],
  })
  const executors: ExecutorRegistry = { ...stubExecutors, listen: interactiveExecutor }
  const finalState = await runRecipe(
    recipe, emptyKitchen, undefined,
    (_stepIndex, _interaction) => Promise.resolve({ email: 'user@test.com' }),
    undefined, executors,
  )
  assertEquals(finalState.complete, true)
  assertEquals(finalState.context['step 1']?.email, 'user@test.com')
})
