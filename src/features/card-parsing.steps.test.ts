// Step definitions for card-parsing.feature

import { Given, When, Then } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { parseCard } from '../parser/card-parser.ts'
import { loadFixture } from '../test/helpers/fixture-loader.ts'
import { assertEquals, assertExists, assertGreater } from 'jsr:@std/assert'
import type { World } from '../test/bdd/world.ts'

Given('a card file {string}', async (world: World, filename: string) => {
  world.rawText = await loadFixture(filename)
})

When('I parse the card definition', (world: World) => {
  assertExists(world.rawText, 'No card text to parse')
  world.cardDefinition = parseCard(world.rawText)
})

Then('the card name should be {string}', (world: World, name: string) => {
  assertExists(world.cardDefinition)
  assertEquals(world.cardDefinition.name, name)
})

Then('the card type should be {string}', (world: World, type: string) => {
  assertExists(world.cardDefinition)
  assertEquals(world.cardDefinition.type, type)
})

Then('the card should have a purpose', (world: World) => {
  assertExists(world.cardDefinition)
  assertGreater(world.cardDefinition.purpose.length, 0)
})

Then('the card should have {int} equipment requirements', (world: World, count: string) => {
  assertExists(world.cardDefinition)
  assertEquals(world.cardDefinition.equipment.length, parseInt(count))
})

Then('the card should have a config field {string}', (world: World, fieldName: string) => {
  assertExists(world.cardDefinition)
  const found = world.cardDefinition.configFields.some(f => f.name === fieldName)
  assertEquals(found, true, `Expected config field "${fieldName}"`)
})

Then('the card should have a technique', (world: World) => {
  assertExists(world.cardDefinition)
  assertExists(world.cardDefinition.technique, 'Expected card to have a technique')
})

Then('the card should not have a technique', (world: World) => {
  assertExists(world.cardDefinition)
  assertEquals(world.cardDefinition.technique, undefined, 'Expected card to have no technique')
})

Then('the technique voice should contain {string}', (world: World, text: string) => {
  assertExists(world.cardDefinition?.technique, 'No technique found')
  assertEquals(
    world.cardDefinition.technique.voice.toLowerCase().includes(text.toLowerCase()),
    true,
    `Expected technique voice to contain "${text}"`,
  )
})

Then('the technique constraints should contain {string}', (world: World, text: string) => {
  assertExists(world.cardDefinition?.technique, 'No technique found')
  assertEquals(
    world.cardDefinition.technique.constraints.toLowerCase().includes(text.toLowerCase()),
    true,
    `Expected technique constraints to contain "${text}"`,
  )
})

Then('the technique expertise should contain {string}', (world: World, text: string) => {
  assertExists(world.cardDefinition?.technique, 'No technique found')
  assertEquals(
    world.cardDefinition.technique.expertise.toLowerCase().includes(text.toLowerCase()),
    true,
    `Expected technique expertise to contain "${text}"`,
  )
})

// Run the feature file
runFeature(new URL('./card-parsing.feature', import.meta.url).href)
