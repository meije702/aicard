import { assertEquals } from "jsr:@std/assert"
import { resolveValue, resolveAllValues } from './resolve-value.ts'
import type { RecipeContext } from '../types.ts'

Deno.test("resolveValue: returns a plain string unchanged", () => {
  assertEquals(resolveValue('hello world', {}), 'hello world')
})

Deno.test("resolveValue: resolves a {step N: key} reference from context", () => {
  const context: RecipeContext = {
    'step 1': { 'customer email': 'maria@example.com' },
  }
  assertEquals(resolveValue('{step 1: customer email}', context), 'maria@example.com')
})

Deno.test("resolveValue: resolves a reference embedded in surrounding text", () => {
  const context: RecipeContext = {
    'step 1': { name: 'Maria' },
  }
  assertEquals(resolveValue('Hello, {step 1: name}!', context), 'Hello, Maria!')
})

Deno.test("resolveValue: resolves multiple references in one string", () => {
  const context: RecipeContext = {
    'step 1': { 'first name': 'Maria' },
    'step 2': { subject: 'Your order' },
  }
  const result = resolveValue('{step 1: first name}: {step 2: subject}', context)
  assertEquals(result, 'Maria: Your order')
})

Deno.test("resolveValue: leaves a reference intact when the step is missing from context", () => {
  const context: RecipeContext = {}
  assertEquals(resolveValue('{step 1: customer email}', context), '{step 1: customer email}')
})

Deno.test("resolveValue: leaves a reference intact when the key is missing from the step output", () => {
  const context: RecipeContext = {
    'step 1': { name: 'Maria' },
  }
  assertEquals(resolveValue('{step 1: missing key}', context), '{step 1: missing key}')
})

Deno.test("resolveValue: resolves a reference with extra whitespace around the key", () => {
  const context: RecipeContext = {
    'step 1': { 'customer email': 'maria@example.com' },
  }
  assertEquals(resolveValue('{step 1:  customer email }', context), 'maria@example.com')
})

Deno.test("resolveValue: returns an empty string unchanged", () => {
  assertEquals(resolveValue('', {}), '')
})

// --- resolveAllValues: error-tracking resolution for execution time ---

Deno.test("resolveAllValues: resolves all config values with no errors when context is complete", () => {
  const context: RecipeContext = {
    'step 1': { 'customer email': 'maria@example.com', name: 'Maria' },
  }
  const config = { to: '{step 1: customer email}', greeting: 'Hello {step 1: name}' }
  const result = resolveAllValues(config, context, 3)
  assertEquals(result.resolved, { to: 'maria@example.com', greeting: 'Hello Maria' })
  assertEquals(result.errors, [])
})

Deno.test("resolveAllValues: reports error when referenced step has no output", () => {
  const config = { to: '{step 1: customer email}' }
  const result = resolveAllValues(config, {}, 3)
  assertEquals(result.errors.length, 1)
  assertEquals(result.errors[0].includes('step 1'), true)
  assertEquals(result.errors[0].includes('customer email'), true)
})

Deno.test("resolveAllValues: reports error when referenced key is missing from step output", () => {
  const context: RecipeContext = {
    'step 1': { name: 'Maria' },
  }
  const config = { to: '{step 1: customer email}' }
  const result = resolveAllValues(config, context, 3)
  assertEquals(result.errors.length, 1)
  assertEquals(result.errors[0].includes('customer email'), true)
  assertEquals(result.errors[0].includes("didn't produce"), true)
})

Deno.test("resolveAllValues: resolves valid refs and reports errors for invalid refs in same config", () => {
  const context: RecipeContext = {
    'step 1': { name: 'Maria' },
  }
  const config = {
    greeting: 'Hello {step 1: name}',
    to: '{step 1: customer email}',
  }
  const result = resolveAllValues(config, context, 2)
  assertEquals(result.resolved['greeting'], 'Hello Maria')
  // The unresolved key keeps the raw template
  assertEquals(result.resolved['to'], '{step 1: customer email}')
  assertEquals(result.errors.length, 1)
})

Deno.test("resolveAllValues: passes through plain values with no errors", () => {
  const config = { to: 'maria@example.com', subject: 'Thanks!' }
  const result = resolveAllValues(config, {}, 1)
  assertEquals(result.resolved, { to: 'maria@example.com', subject: 'Thanks!' })
  assertEquals(result.errors, [])
})
