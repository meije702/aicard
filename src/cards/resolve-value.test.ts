import { assertEquals } from "jsr:@std/assert"
import { resolveValue } from './resolve-value.ts'
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
