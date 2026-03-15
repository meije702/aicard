// Step definitions for recipe-running.feature

import { Given, Then, When } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { checkRecipeReadiness, recipeHasWaitSteps } from '../runner/recipe-runner.ts'
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
  // Store readiness result on the world for Then steps to inspect
  world.runState = {
    recipeName: world.recipe.name,
    steps: [],
    context: {},
    complete: result.ready,
    errors: result.missing,
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
