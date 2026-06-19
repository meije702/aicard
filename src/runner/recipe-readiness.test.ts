// Tests for recipe-readiness: pre-flight checks before recipe execution.

import { assertEquals } from '@std/assert'
import { checkRecipeReadiness, recipeHasWaitSteps } from './recipe-readiness.ts'
import type { Recipe, Kitchen, Equipment } from '../types.ts'
import type { CardExecutor } from '../cards/card-executor.ts'

function makeEquipment(name: string, connected = true): Equipment {
    return { name, type: name.toLowerCase(), connected, config: {} }
}

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

function stubExecutor(overrides: Partial<CardExecutor> = {}): CardExecutor {
    return {
        type: 'listen',
        checkEquipment: () => ({ ready: true, missing: [] }),
        execute: async () => ({ success: true, output: {}, message: 'done' }),
        describe: () => 'Stub step',
        ...overrides,
    }
}

const emptyKitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }

// --- checkRecipeReadiness ---

Deno.test('checkRecipeReadiness: empty recipe with no requirements is ready', () => {
    const result = checkRecipeReadiness(makeRecipe(), emptyKitchen, {})
    assertEquals(result.ready, true)
    assertEquals(result.blockers, [])
})

Deno.test('checkRecipeReadiness: case-insensitive equipment matching', () => {
    const recipe = makeRecipe({ kitchen: ['shopify'] })
    const kitchen: Kitchen = {
        equipment: [makeEquipment('Shopify')],
        recipes: [],
        pantry: [],
    }
    const result = checkRecipeReadiness(recipe, kitchen, {})
    assertEquals(result.ready, true)
    assertEquals(result.blockers, [])
})

Deno.test('checkRecipeReadiness: disconnected equipment produces blocker', () => {
    const recipe = makeRecipe({ kitchen: ['Gmail'] })
    const kitchen: Kitchen = {
        equipment: [makeEquipment('Gmail', false)],
        recipes: [],
        pantry: [],
    }
    const result = checkRecipeReadiness(recipe, kitchen, {})
    assertEquals(result.ready, false)
    assertEquals(result.blockers.length, 1)
    assertEquals(result.blockers[0].kind, 'equipment')
    assertEquals(result.blockers[0].label, 'Gmail')
})

Deno.test('checkRecipeReadiness: duplicate equipment names do not produce duplicate blockers', () => {
    const recipe = makeRecipe({ kitchen: ['Slack', 'Slack'] })
    const result = checkRecipeReadiness(recipe, emptyKitchen, {})
    assertEquals(result.blockers.length, 1)
})

Deno.test('checkRecipeReadiness: unknown card type produces card-type blocker', () => {
    const recipe = makeRecipe({
        steps: [{ number: 1, name: 'Transform', card: 'transform' as never, config: {} }],
    })
    const result = checkRecipeReadiness(recipe, emptyKitchen, {})
    assertEquals(result.ready, false)
    assertEquals(result.blockers.length, 1)
    assertEquals(result.blockers[0].kind, 'card-type')
    assertEquals(result.blockers[0].label, 'transform')
})

Deno.test('checkRecipeReadiness: executor checkEquipment adds equipment blocker', () => {
    const executor = stubExecutor({
        checkEquipment: () => ({ ready: false, missing: ['Slack'] }),
    })
    const recipe = makeRecipe({
        steps: [{ number: 1, name: 'Listen', card: 'listen', config: {} }],
    })
    const result = checkRecipeReadiness(recipe, emptyKitchen, { listen: executor })
    assertEquals(result.ready, false)
    assertEquals(result.blockers.some(b => b.kind === 'equipment' && b.label === 'Slack'), true)
})

Deno.test('checkRecipeReadiness: executor equipment deduplicates against Layer 1 blockers', () => {
    const executor = stubExecutor({
        checkEquipment: () => ({ ready: false, missing: ['Slack'] }),
    })
    const recipe = makeRecipe({
        kitchen: ['Slack'],
        steps: [{ number: 1, name: 'Listen', card: 'listen', config: {} }],
    })
    const result = checkRecipeReadiness(recipe, emptyKitchen, { listen: executor })
    const slackBlockers = result.blockers.filter(b => b.label === 'Slack')
    assertEquals(slackBlockers.length, 1)
})

Deno.test('checkRecipeReadiness: mixed equipment and card-type blockers', () => {
    const executor = stubExecutor()
    const recipe = makeRecipe({
        kitchen: ['Gmail'],
        steps: [
            { number: 1, name: 'Listen', card: 'listen', config: {} },
            { number: 2, name: 'Transform', card: 'transform' as never, config: {} },
        ],
    })
    const result = checkRecipeReadiness(recipe, emptyKitchen, { listen: executor })
    assertEquals(result.ready, false)
    assertEquals(result.blockers.some(b => b.kind === 'equipment'), true)
    assertEquals(result.blockers.some(b => b.kind === 'card-type'), true)
})

// --- recipeHasWaitSteps ---

Deno.test('recipeHasWaitSteps: true when recipe has a wait card step', () => {
    const recipe = makeRecipe({
        steps: [{ number: 1, name: 'Pause', card: 'wait', config: { 'how long': '1 day' } }],
    })
    assertEquals(recipeHasWaitSteps(recipe), true)
})

Deno.test('recipeHasWaitSteps: false for sub-recipe-only steps', () => {
    const recipe = makeRecipe({
        steps: [{ number: 1, name: 'Run alerts', recipe: 'Alert Team' }],
    })
    assertEquals(recipeHasWaitSteps(recipe), false)
})

Deno.test('recipeHasWaitSteps: false for empty recipe', () => {
    assertEquals(recipeHasWaitSteps(makeRecipe()), false)
})
