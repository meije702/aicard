// Tests for sub-recipe-runner: Level 3 (Combining) sub-recipe execution.

import { assertEquals, assertStringIncludes } from '@std/assert'
import { createSubRecipeRunner } from './sub-recipe-runner.ts'
import type { Recipe, Kitchen } from '../types.ts'
import type { CardExecutor } from '../cards/card-executor.ts'
import type { ExecutorRegistry } from './run-types.ts'

// A stub wait executor that resolves instantly (no real delay)
const instantWaitExecutor: CardExecutor = {
    type: 'wait',
    checkEquipment: () => ({ ready: true, missing: [] }),
    execute: async () => ({ success: true, output: {}, message: 'waited' }),
    describe: (config) => `Waiting ${config['how long'] ?? '...'}`,
}

const stubListenExecutor: CardExecutor = {
    type: 'listen',
    checkEquipment: () => ({ ready: true, missing: [] }),
    execute: async () => ({ success: true, output: { event: 'received' }, message: 'listened' }),
    describe: () => 'Listening...',
}

const failingExecutor: CardExecutor = {
    type: 'listen',
    checkEquipment: () => ({ ready: true, missing: [] }),
    execute: async () => ({ success: false, output: {}, message: 'executor failed' }),
    describe: () => 'Will fail',
}

const testExecutors: ExecutorRegistry = {
    wait: instantWaitExecutor,
    listen: stubListenExecutor,
    'send-message': stubListenExecutor,
}

function makeRecipe(name: string, steps: Recipe['steps'] = []): Recipe {
    return { name, purpose: '', kitchen: [], steps, errors: [] }
}

function makeKitchen(recipes: Recipe[]): Kitchen {
    return { equipment: [], recipes, pantry: [] }
}

Deno.test('subRecipeRunner: returns failure at max depth (3)', async () => {
    const kitchen = makeKitchen([makeRecipe('Inner')])
    const runner = createSubRecipeRunner(kitchen, testExecutors, 3)
    const result = await runner('Inner')
    assertEquals(result.success, false)
    assertStringIncludes(result.message, 'too deep')
})

Deno.test('subRecipeRunner: depth 2 still succeeds', async () => {
    const inner = makeRecipe('Inner', [
        { number: 1, name: 'Quick wait', card: 'wait', config: { 'how long': '1 second' } },
    ])
    const kitchen = makeKitchen([inner])
    const runner = createSubRecipeRunner(kitchen, testExecutors, 2)
    const result = await runner('Inner')
    assertEquals(result.success, true)
})

Deno.test('subRecipeRunner: case-insensitive recipe lookup', async () => {
    const inner = makeRecipe('Alert Team', [
        { number: 1, name: 'Quick wait', card: 'wait', config: { 'how long': '1 second' } },
    ])
    const kitchen = makeKitchen([inner])
    const runner = createSubRecipeRunner(kitchen, testExecutors, 0)
    const result = await runner('alert team')
    assertEquals(result.success, true)
})

Deno.test('subRecipeRunner: missing recipe returns descriptive error', async () => {
    const kitchen = makeKitchen([])
    const runner = createSubRecipeRunner(kitchen, testExecutors, 0)
    const result = await runner('Nonexistent Recipe')
    assertEquals(result.success, false)
    assertStringIncludes(result.message, 'Nonexistent Recipe')
    assertStringIncludes(result.message, 'not in your kitchen')
})

Deno.test('subRecipeRunner: inner recipe failure propagates', async () => {
    const inner = makeRecipe('Failing', [
        { number: 1, name: 'Bad step', card: 'listen', config: {} },
    ])
    const kitchen = makeKitchen([inner])
    const failExecutors: ExecutorRegistry = {
        ...testExecutors,
        listen: failingExecutor,
    }
    const runner = createSubRecipeRunner(kitchen, failExecutors, 0)
    const result = await runner('Failing')
    assertEquals(result.success, false)
    assertStringIncludes(result.message, 'stopped')
})

Deno.test('subRecipeRunner: successful sub-recipe returns step count', async () => {
    const inner = makeRecipe('Two Steps', [
        { number: 1, name: 'Step A', card: 'wait', config: { 'how long': '1 second' } },
        { number: 2, name: 'Step B', card: 'wait', config: { 'how long': '1 second' } },
    ])
    const kitchen = makeKitchen([inner])
    const runner = createSubRecipeRunner(kitchen, testExecutors, 0)
    const result = await runner('Two Steps')
    assertEquals(result.success, true)
    assertEquals(result.output.steps, '2')
})

Deno.test('subRecipeRunner: nested sub-recipes work up to depth limit', async () => {
    // Recipe C (leaf)
    const recipeC = makeRecipe('C', [
        { number: 1, name: 'Leaf', card: 'wait', config: { 'how long': '1 second' } },
    ])
    // Recipe B calls C
    const recipeB = makeRecipe('B', [
        { number: 1, name: 'Call C', recipe: 'C' },
    ])
    // Recipe A calls B
    const recipeA = makeRecipe('A', [
        { number: 1, name: 'Call B', recipe: 'B' },
    ])

    const kitchen = makeKitchen([recipeA, recipeB, recipeC])
    const runner = createSubRecipeRunner(kitchen, testExecutors, 0)
    // Runner at depth 0 calls B (depth 1), which calls C (depth 2) — under MAX_DEPTH 3
    const result = await runner('B')
    assertEquals(result.success, true)
})
