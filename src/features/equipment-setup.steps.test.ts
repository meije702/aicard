// BDD step definitions for equipment-setup.feature

import { assertEquals, assertExists } from 'jsr:@std/assert'
import { Given, When, Then } from '../test/bdd/step-registry.ts'
import { runFeature } from '../test/bdd/runner.ts'
import { loadFixture } from '../test/helpers/fixture-loader.ts'
import { parseEquipmentDefinition } from '../parser/equipment-parser.ts'
import { buildFallbackStepResponse } from '../sous-chef/equipment-prompts.ts'
import { parseWizardStepResponse } from '../parser/wizard-response-parser.ts'
import type { World } from '../test/bdd/world.ts'

// --- Given steps ---

Given('an equipment file {string}', async (world: World, filename: string) => {
  world.rawText = await loadFixture(filename)
})

Given('a valid wizard JSON response', (world: World) => {
  world.rawText = JSON.stringify({
    instruction: 'Enter your token',
    fields: [{ key: 'token', type: 'password', label: 'Token', required: true }],
    canAdvance: true,
  })
})

Given('a malformed wizard response', (world: World) => {
  world.rawText = 'This is not JSON at all'
})

// --- When steps ---

When('I parse the equipment definition', (world: World) => {
  world.equipmentDefinition = parseEquipmentDefinition(world.rawText!)
})

When('I build a fallback step response for step {int}', (world: World, stepNumberStr: string) => {
  world.wizardStepResponse = buildFallbackStepResponse(world.equipmentDefinition!, parseInt(stepNumberStr, 10))
})

When('I parse the wizard response', (world: World) => {
  const { response } = parseWizardStepResponse(world.rawText!)
  world.wizardStepResponse = response
})

// --- Then steps ---

Then('the equipment name should be {string}', (world: World, name: string) => {
  assertEquals(world.equipmentDefinition!.name, name)
})

Then('the equipment mode should be {string}', (world: World, mode: string) => {
  assertEquals(world.equipmentDefinition!.mode, mode)
})

Then('the equipment should have {int} steps', (world: World, countStr: string) => {
  assertEquals(world.equipmentDefinition!.steps.length, parseInt(countStr, 10))
})

Then('the equipment should have a technique', (world: World) => {
  assertExists(world.equipmentDefinition!.technique)
})

Then('the equipment should have {int} config fields', (world: World, countStr: string) => {
  assertEquals(world.equipmentDefinition!.configFields.length, parseInt(countStr, 10))
})

Then('the config field {string} should have validation {string}', (world: World, fieldName: string, rule: string) => {
  const field = world.equipmentDefinition!.configFields.find(f => f.name === fieldName)
  assertExists(field, `Config field "${fieldName}" not found`)
  assertEquals(field.validate, rule)
})

Then('the equipment should have {int} documentation links', (world: World, countStr: string) => {
  assertEquals(world.equipmentDefinition!.documentation.length, parseInt(countStr, 10))
})

Then('the wizard step should have {int} fields', (world: World, countStr: string) => {
  assertEquals(world.wizardStepResponse!.fields.length, parseInt(countStr, 10))
})

Then('the wizard step instruction should contain {string}', (world: World, text: string) => {
  assertEquals(world.wizardStepResponse!.instruction.includes(text), true,
    `Expected instruction to contain "${text}", got: "${world.wizardStepResponse!.instruction}"`)
})

Then('the wizard step should have a password field', (world: World) => {
  const hasPassword = world.wizardStepResponse!.fields.some(f => f.type === 'password')
  assertEquals(hasPassword, true, 'Expected at least one password field')
})

// --- Run feature ---

runFeature(new URL('./equipment-setup.feature', import.meta.url).href)
