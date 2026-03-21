// Step definitions for recipe-parsing.feature

import { Given, When, Then } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { loadFixture } from '../test/helpers/fixture-loader.ts'
import { assertEquals, assertExists, assertGreater } from 'jsr:@std/assert'
import type { World } from '../test/bdd/world.ts'
import type { CardStep } from '../types.ts'

Given('a recipe file {string}', async (world: World, filename: string) => {
  world.rawText = await loadFixture(filename)
})

Given('recipe text:', (world: World, docstring: string) => {
  world.rawText = docstring
})

When('I parse the recipe', (world: World) => {
  assertExists(world.rawText, 'No recipe text to parse')
  const parsed = parseRecipe(world.rawText)
  // Materialise a Recipe in all cases so Then steps can inspect name/errors uniformly.
  // On failure the partialRecipe is filled with defaults for any missing fields.
  world.recipe = parsed.success
    ? parsed.recipe
    : {
        name:    parsed.partialRecipe.name    ?? '',
        purpose: parsed.partialRecipe.purpose ?? '',
        kitchen: parsed.partialRecipe.kitchen ?? [],
        steps:   parsed.partialRecipe.steps   ?? [],
        errors:  parsed.errors,
      }
})

Then('the recipe name should be {string}', (world: World, name: string) => {
  assertExists(world.recipe)
  assertEquals(world.recipe.name, name)
})

Then('the recipe should have a purpose', (world: World) => {
  assertExists(world.recipe)
  assertGreater(world.recipe.purpose.length, 0)
})

Then('the recipe should have {int} steps', (world: World, count: string) => {
  assertExists(world.recipe)
  assertEquals(world.recipe.steps.length, parseInt(count))
})

Then('the recipe should have no errors', (world: World) => {
  assertExists(world.recipe)
  assertEquals(world.recipe.errors.length, 0)
})

Then('the recipe should have errors', (world: World) => {
  assertExists(world.recipe)
  assertGreater(world.recipe.errors.length, 0)
})

Then('the kitchen should require {string}', (world: World, name: string) => {
  assertExists(world.recipe)
  const found = world.recipe.kitchen.includes(name)
  assertEquals(found, true, `Expected kitchen to require "${name}"`)
})

Then('the kitchen should be empty', (world: World) => {
  assertExists(world.recipe)
  assertEquals(world.recipe.kitchen.length, 0)
})

Then('step {int} should use the {string} card', (world: World, num: string, card: string) => {
  assertExists(world.recipe)
  const step = world.recipe.steps[parseInt(num) - 1] as CardStep
  assertExists(step)
  assertEquals(step.card, card)
})

Then('step {int} should be named {string}', (world: World, num: string, name: string) => {
  assertExists(world.recipe)
  const step = world.recipe.steps[parseInt(num) - 1]
  assertExists(step)
  assertEquals(step.name, name)
})

Then('step {int} should have setting {string} with value {string}', (world: World, num: string, key: string, value: string) => {
  assertExists(world.recipe)
  const step = world.recipe.steps[parseInt(num) - 1] as CardStep
  assertExists(step)
  assertEquals(step.config[key], value)
})

// Run the feature file
runFeature(new URL('./recipe-parsing.feature', import.meta.url).href)
