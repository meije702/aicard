// Step definitions for recipe-running.feature

import { Given, Then, When } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { runRecipe } from '../runner/recipe-runner.ts'
import { checkRecipeReadiness, recipeHasWaitSteps } from '../runner/recipe-readiness.ts'
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

// --- Level 1: Listen card manual confirmation ---

import { listenExecutor } from '../cards/listen.ts'
import { sendMessageExecutor } from '../cards/send-message.ts'

Given('a Listen step listening for {string} from {string}', (world: World, event: string, source: string) => {
  world.recipe = RecipeBuilder.named('Test')
    .withEquipment(source)
    .withStep('Listen', 'listen', { 'listen for': event, from: source })
    .build()
})

When('I run the step with the user entering {string} as {string} and {string} as {string}',
  async (world: World, field1: string, value1: string, field2: string, value2: string) => {
    world.cardResult = await listenExecutor.execute(
      { 'listen for': 'new order', from: 'Shopify' },
      {},
      world.kitchen,
      async () => ({ [field1]: value1, [field2]: value2 })
    )
  }
)

// --- Level 1: Send Message compose-and-hand-off ---

Given('a Send Message step to {string} with subject {string} and message {string}',
  (world: World, to: string, subject: string, message: string) => {
    world.recipe = RecipeBuilder.named('Test')
      .withStep('Send', 'send-message', { to, subject, message })
      .build()
  }
)

When('I run the step in headless mode', async (world: World) => {
  const step = world.recipe?.steps[0]
  if (!step || !('card' in step)) return
  world.cardResult = await sendMessageExecutor.execute(step.config, {}, world.kitchen)
})

Then('the step should succeed', (world: World) => {
  assertExists(world.cardResult)
  assertEquals(world.cardResult.success, true)
})

Then('the step result should say {string} not {string}', (world: World, present: string, absent: string) => {
  assertExists(world.cardResult)
  assertEquals(world.cardResult.message.includes(present), true, `Expected message to include "${present}"`)
  assertEquals(world.cardResult.message.toLowerCase().includes(absent.toLowerCase()), false, `Expected message not to include "${absent}"`)
})

Then('the step output should include {string} with value {string}', (world: World, key: string, value: string) => {
  assertExists(world.cardResult)
  assertEquals(world.cardResult.output[key], value)
})

// --- Level 2: config override at runtime ---

Given('a Wait step configured for {string}', (world: World, duration: string) => {
  world.recipe = RecipeBuilder.named('Test')
    .withStep('Wait', 'wait', { 'how long': duration })
    .build()
})

When('I run the step with a config override of {string} set to {string}',
  async (world: World, key: string, value: string) => {
    assertExists(world.recipe)
    world.startedAt = Date.now()
    const finalState = await runRecipe(
      world.recipe,
      world.kitchen,
      undefined,
      undefined,
      () => ({ [key]: value })
    )
    world.runState = finalState
  }
)

Then('the recipe should complete successfully', (world: World) => {
  assertExists(world.runState)
  assertEquals(world.runState.complete, true)
})

Then('the step should complete in under 5 seconds', (world: World) => {
  assertExists(world.startedAt)
  const elapsed = Date.now() - world.startedAt
  assertEquals(elapsed < 5000, true, `Expected completion in under 5s, took ${elapsed}ms`)
})

// --- Sub-recipe: parsed without error, skipped at runtime ---

Given('a recipe with a sub-recipe step named {string} calling {string}',
  (world: World, stepName: string, recipeName: string) => {
    world.recipe = RecipeBuilder.named('Test')
      .withSubRecipeStep(stepName, recipeName)
      .build()
  }
)

When('I run the recipe', async (world: World) => {
  assertExists(world.recipe)
  world.runState = await runRecipe(world.recipe, world.kitchen)
})

Then('the sub-recipe step should have status {string}', (world: World, expectedStatus: string) => {
  assertExists(world.runState)
  const step = world.runState.steps[0]
  assertExists(step)
  assertEquals(step.status, expectedStatus)
})

Then('the step description should include {string}', (world: World, text: string) => {
  assertExists(world.runState)
  const description = world.runState.steps[0]?.description ?? ''
  assertEquals(
    description.includes(text), true,
    `Expected step description to include "${text}", got: "${description}"`
  )
})

Then('the step should have status {string}', (world: World, expectedStatus: string) => {
  assertExists(world.runState)
  const step = world.runState.steps[0]
  assertExists(step)
  assertEquals(step.status, expectedStatus)
})

Then('the step result should include {string}', (world: World, text: string) => {
  assertExists(world.runState)
  const message = world.runState.steps[0]?.result?.message ?? ''
  assertEquals(
    message.includes(text), true,
    `Expected step result to include "${text}", got: "${message}"`
  )
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
