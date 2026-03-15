// Step definitions for recipe-running.feature

import { Given, Then, When } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { checkRecipeReadiness, recipeHasWaitSteps, runRecipe } from '../runner/recipe-runner.ts'
import { RecipeBuilder } from '../test/helpers/recipe-builder.ts'
import { assertEquals, assertExists } from 'jsr:@std/assert'
import type { World } from '../test/bdd/world.ts'

Given('a recipe that needs {string} and {string}', (world: World, eq1: string, eq2: string) => {
  world.recipe = RecipeBuilder.named('Test')
    .withEquipment(eq1, eq2)
    .withStep('Step 1', 'listen', { 'listen for': 'test', from: eq1 })
    .build()
})

Given('a recipe that needs {string}', (world: World, eq: string) => {
  world.recipe = RecipeBuilder.named('Test')
    .withEquipment(eq)
    .withStep('Step 1', 'listen', { 'listen for': 'test', from: eq })
    .build()
})

Given('a kitchen with no equipment', (world: World) => {
  world.kitchen = { equipment: [], recipes: [], pantry: [] }
})

Given('a kitchen with connected {string}', (world: World, name: string) => {
  world.kitchen = {
    equipment: [{ name, type: name.toLowerCase(), connected: true, config: {} }],
    recipes: [],
    pantry: [],
  }
})

Given('a recipe with a {string} step', (world: World, cardType: string) => {
  world.recipe = RecipeBuilder.named('Test')
    .withStep('Test step', cardType as 'listen' | 'wait' | 'send-message', {})
    .build()
})

When('I check recipe readiness', (world: World) => {
  assertExists(world.recipe)
  const result = checkRecipeReadiness(world.recipe, world.kitchen)
  // Store readiness result on the world for Then steps to inspect.
  // Map blockers back to labels so the existing Then steps (which check errors[])
  // continue to work without change.
  world.runState = {
    runId: `${world.recipe.name}:test`,
    recipeName: world.recipe.name,
    steps: [],
    context: {},
    complete: result.ready,
    errors: result.blockers.map(b => b.label),
  }
})

Then('the recipe should not be ready', (world: World) => {
  assertExists(world.runState)
  assertEquals(world.runState.complete, false)
})

Then('the recipe should be ready', (world: World) => {
  assertExists(world.runState)
  assertEquals(world.runState.complete, true)
})

Then('the missing equipment should include {string}', (world: World, name: string) => {
  assertExists(world.runState)
  const found = world.runState.errors.includes(name)
  assertEquals(found, true, `Expected missing equipment to include "${name}"`)
})

Then('the recipe should have wait steps', (world: World) => {
  assertExists(world.recipe)
  assertEquals(recipeHasWaitSteps(world.recipe), true)
})

Then('the recipe should not have wait steps', (world: World) => {
  assertExists(world.recipe)
  assertEquals(recipeHasWaitSteps(world.recipe), false)
})

// Run the feature file
runFeature(new URL('./recipe-running.feature', import.meta.url).href)

// --- Direct tests for failure-path semantics (findings 1b, 1c, 1a) ---

import type { Kitchen, CardType } from '../types.ts'

Deno.test("checkRecipeReadiness: unknown card type is flagged before run", () => {
  const recipe = RecipeBuilder.named('Test')
    .withStep('Transform data', 'transform' as CardType, { input: 'test' })
    .build()
  const kitchen: Kitchen = { equipment: [], recipes: [], pantry: [] }

  const result = checkRecipeReadiness(recipe, kitchen)
  assertEquals(result.ready, false)
  const hasUnknownCard = result.blockers.some(b => b.kind === 'card-type' && b.label === 'transform')
  assertEquals(hasUnknownCard, true, `Expected blockers to include card-type "transform"`)
})

Deno.test("checkRecipeReadiness: Listen card checks specific named equipment", () => {
  const recipe = RecipeBuilder.named('Test')
    .withEquipment('Shopify')
    .withStep('Listen for order', 'listen', { 'listen for': 'new order', from: 'Shopify' })
    .build()
  // Kitchen has Gmail connected but NOT Shopify
  const kitchen: Kitchen = {
    equipment: [{ name: 'Gmail', type: 'gmail', connected: true, config: {} }],
    recipes: [],
    pantry: [],
  }

  const result = checkRecipeReadiness(recipe, kitchen)
  assertEquals(result.ready, false)
  assertEquals(result.blockers.some(b => b.kind === 'equipment' && b.label === 'Shopify'), true, 'Expected Shopify blocker')
})

Deno.test("checkRecipeReadiness: Listen card passes when specific equipment is connected", () => {
  const recipe = RecipeBuilder.named('Test')
    .withEquipment('Shopify')
    .withStep('Listen for order', 'listen', { 'listen for': 'new order', from: 'Shopify' })
    .build()
  const kitchen: Kitchen = {
    equipment: [{ name: 'Shopify', type: 'shopify', connected: true, config: {} }],
    recipes: [],
    pantry: [],
  }

  const result = checkRecipeReadiness(recipe, kitchen)
  assertEquals(result.ready, true)
})

Deno.test("checkRecipeReadiness: valid card types are not flagged", () => {
  const recipe = RecipeBuilder.named('Test')
    .withStep('Listen', 'listen', {})
    .withStep('Wait', 'wait', { 'how long': '3 days' })
    .build()
  const kitchen: Kitchen = {
    equipment: [{ name: 'Test', type: 'test', connected: true, config: {} }],
    recipes: [],
    pantry: [],
  }

  const result = checkRecipeReadiness(recipe, kitchen)
  assertEquals(result.ready, true)
})

// --- Runner-level test for unresolved step references (finding 4) ---
// These exercise recipe-runner.ts:121–136 where resolveAllValues() errors fail the step.

Deno.test("runRecipe: unresolved step reference fails step with clear message", async () => {
  // Step 1 references step 0, which doesn't exist — so {step 0: customer email} is unresolvable.
  const recipe = RecipeBuilder.named('Unresolved Ref Test')
    .withStep('Send follow-up', 'send-message', {
      to: '{step 0: customer email}',
      subject: 'Hello',
      message: 'Thanks for your order',
    })
    .build()
  const kitchen: Kitchen = {
    equipment: [{ name: 'Gmail', type: 'gmail', connected: true, config: {} }],
    recipes: [],
    pantry: [],
  }

  const finalState = await runRecipe(recipe, kitchen)

  assertEquals(finalState.complete, false)
  assertEquals(finalState.steps[0].status, 'failed')
  // The error message must name both the missing key and the step number it came from
  const message = finalState.steps[0].result?.message ?? ''
  assertEquals(message.includes('customer email'), true, `Expected message to include "customer email", got: "${message}"`)
  assertEquals(message.includes('step 0'), true, `Expected message to include "step 0", got: "${message}"`)
})

Deno.test("runRecipe: unresolved key in existing step fails with named key", async () => {
  // step 1 produces { sent: 'true', to, subject } but NOT 'order id'.
  // step 2 references {step 1: order id} which doesn't exist in that output.
  const recipe = RecipeBuilder.named('Missing Key Test')
    .withStep('Send confirmation', 'send-message', {
      to: 'customer@example.com',
      subject: 'Confirmed',
      message: 'Done',
    })
    .withStep('Send follow-up', 'send-message', {
      to: '{step 1: order id}',
      subject: 'Follow-up',
      message: 'Here is your order id',
    })
    .build()
  const kitchen: Kitchen = {
    equipment: [{ name: 'Gmail', type: 'gmail', connected: true, config: {} }],
    recipes: [],
    pantry: [],
  }

  const finalState = await runRecipe(recipe, kitchen)

  assertEquals(finalState.complete, false)
  assertEquals(finalState.steps[1].status, 'failed')
  const message = finalState.steps[1].result?.message ?? ''
  assertEquals(message.includes('order id'), true, `Expected message to include "order id", got: "${message}"`)
})
