// Step definitions for kitchen-state.feature

import { Given, When, Then } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { upsertEquipment, removeEquipment, upsertRecipe } from '../kitchen/kitchen-state.ts'
import { parseRecipe } from '../parser/recipe-parser.ts'
import { loadFixture } from '../test/helpers/fixture-loader.ts'
import { assertEquals, assertExists } from 'jsr:@std/assert'
import type { World } from '../test/bdd/world.ts'

Given('a recipe file {string}', async (world: World, filename: string) => {
  world.rawText = await loadFixture(filename)
})

When('I parse the recipe', (world: World) => {
  assertExists(world.rawText, 'No recipe text to parse')
  world.recipe = parseRecipe(world.rawText)
})

Given('a new kitchen', (world: World) => {
  world.kitchen = { equipment: [], recipes: [], pantry: [] }
})

When('I add equipment {string} of type {string}', (world: World, name: string, type: string) => {
  world.kitchen = upsertEquipment(world.kitchen, {
    name,
    type,
    connected: true,
    config: {},
  })
})

When('I remove equipment {string}', (world: World, name: string) => {
  world.kitchen = removeEquipment(world.kitchen, name)
})

When('I add the recipe to the kitchen', (world: World) => {
  assertExists(world.recipe, 'No recipe to add')
  world.kitchen = upsertRecipe(world.kitchen, world.recipe)
})

Then('the kitchen should have {int} pieces of equipment', (world: World, count: string) => {
  assertEquals(world.kitchen.equipment.length, parseInt(count))
})

Then('the kitchen should have {int} recipes', (world: World, count: string) => {
  assertEquals(world.kitchen.recipes.length, parseInt(count))
})

// Run the feature file
runFeature(new URL('./kitchen-state.feature', import.meta.url).href)
