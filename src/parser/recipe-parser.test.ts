import { assertEquals, assertGreater } from "jsr:@std/assert"
import { parseRecipe } from './recipe-parser.ts'
import type { CardStep } from '../types.ts'

const thankyouFixture = await Deno.readTextFile(
  new URL('../fixtures/recipes/thank-you-follow-up.recipe.md', import.meta.url)
)
const communityFixture = await Deno.readTextFile(
  new URL('../fixtures/recipes/community-message-router.recipe.md', import.meta.url)
)

function asCardStep(step: unknown): CardStep {
  const s = step as CardStep
  if (!('card' in s)) throw new Error('Expected a CardStep')
  return s
}

// Helper: assert success and unwrap the recipe, or throw.
function expectSuccess(markdown: string) {
  const parsed = parseRecipe(markdown)
  if (!parsed.success) {
    throw new Error(`Expected parsing to succeed, but got errors: ${parsed.errors.join('; ')}`)
  }
  return parsed.recipe
}

// Helper: assert failure and return the error result.
function expectFailure(markdown: string) {
  const parsed = parseRecipe(markdown)
  if (parsed.success) {
    throw new Error('Expected parsing to fail, but it succeeded')
  }
  return parsed
}

// --- thank-you-follow-up fixture ---

Deno.test("parseRecipe: parses the recipe name from the title heading", () => {
  const recipe = expectSuccess(thankyouFixture)
  assertEquals(recipe.name, 'Thank You Follow-Up')
})

Deno.test("parseRecipe: parses the purpose from the blockquote", () => {
  const recipe = expectSuccess(thankyouFixture)
  assertEquals(
    recipe.purpose,
    'Send a personalised thank you message to new customers three days after their first purchase.'
  )
})

Deno.test("parseRecipe: parses the kitchen equipment list", () => {
  const recipe = expectSuccess(thankyouFixture)
  assertEquals(recipe.kitchen, ['Shopify', 'Gmail'])
})

Deno.test("parseRecipe: parses the correct number of steps", () => {
  const recipe = expectSuccess(thankyouFixture)
  assertEquals(recipe.steps.length, 3)
})

Deno.test("parseRecipe: parses the first step as a Listen card", () => {
  const recipe = expectSuccess(thankyouFixture)
  const step = asCardStep(recipe.steps[0])
  assertEquals(step.card, 'listen')
  assertEquals(step.name, 'Listen for a new order')
})

Deno.test("parseRecipe: parses the second step as a Wait card with config", () => {
  const recipe = expectSuccess(thankyouFixture)
  const step = asCardStep(recipe.steps[1])
  assertEquals(step.card, 'wait')
  assertEquals(step.config['how long'], '3 days')
})

Deno.test("parseRecipe: parses the third step as a Send Message card", () => {
  const recipe = expectSuccess(thankyouFixture)
  const step = asCardStep(recipe.steps[2])
  assertEquals(step.card, 'send-message')
  assertEquals(step.config['to'], '{step 1: customer email}')
})

Deno.test("parseRecipe: returns success with no errors for a well-formed recipe", () => {
  const parsed = parseRecipe(thankyouFixture)
  assertEquals(parsed.success, true)
})

// --- community-message-router fixture ---

Deno.test("parseRecipe: parses community recipe name and steps", () => {
  const recipe = expectSuccess(communityFixture)
  assertEquals(recipe.name, 'Community Message Router')
  assertEquals(recipe.steps.length, 2)
})

Deno.test("parseRecipe: parses community recipe equipment", () => {
  const recipe = expectSuccess(communityFixture)
  assertEquals(recipe.kitchen.includes('Discord'), true)
  assertEquals(recipe.kitchen.includes('Gmail'), true)
})

// --- card type normalisation ---

Deno.test("parseRecipe: normalises card type names to lowercase-hyphenated", () => {
  const recipe = expectSuccess(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### 1. First step
*Card: Send Message*
- To: someone
  `)
  const step = asCardStep(recipe.steps[0])
  assertEquals(step.card, 'send-message')
})

Deno.test("parseRecipe: normalises config keys to lowercase", () => {
  const recipe = expectSuccess(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### 1. Wait
*Card: Wait*
- How Long: 5 days
  `)
  const step = asCardStep(recipe.steps[0])
  assertEquals(step.config['how long'], '5 days')
})

// --- unknown card type produces a parse error ---

Deno.test("parseRecipe: returns failure for an unknown card type", () => {
  const result = expectFailure(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### 1. Make Coffee
*Card: Make Coffee*
  `)
  assertGreater(result.errors.length, 0)
  assertEquals(result.errors.some(e => e.includes('Make Coffee') || e.includes('make-coffee')), true)
})

// --- graceful handling of incomplete recipes ---

Deno.test("parseRecipe: returns sensible defaults when Kitchen section is missing", () => {
  const recipe = expectSuccess(`
# Minimal Recipe
> A recipe with no kitchen section.
## Steps
### 1. Wait
*Card: Wait*
- How long: 1 hour
  `)
  assertEquals(recipe.kitchen, [])
  assertEquals(recipe.steps.length, 1)
})

Deno.test("parseRecipe: returns failure when the title is missing", () => {
  const result = expectFailure(`
> A recipe with no title.
## Steps
### 1. Wait
*Card: Wait*
- How long: 1 hour
  `)
  assertGreater(result.errors.length, 0)
  assertEquals(result.partialRecipe.name, '')
})

Deno.test("parseRecipe: returns failure with empty steps when Steps section is missing", () => {
  const result = expectFailure(`
# No Steps Recipe
> This recipe has no steps.
## Kitchen
- None
  `)
  assertEquals(result.partialRecipe.steps, [])
  assertGreater(result.errors.length, 0)
})

// --- Fix A: case-insensitive section header matching ---

Deno.test("parseRecipe: parses kitchen section with lowercase heading", () => {
  const recipe = expectSuccess(`
# Test Recipe
> Test purpose.
## kitchen
- Shopify
- Gmail
## Steps
### 1. Wait
*Card: Wait*
- How long: 1 hour
  `)
  assertEquals(recipe.kitchen, ['Shopify', 'Gmail'])
  assertEquals(recipe.errors.length, 0)
})

Deno.test("parseRecipe: parses steps section with uppercase heading", () => {
  const recipe = expectSuccess(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## STEPS
### 1. Wait
*Card: Wait*
- How long: 1 hour
  `)
  assertEquals(recipe.steps.length, 1)
  assertEquals(recipe.errors.length, 0)
})

// --- Fix B: sequential step number validation ---

Deno.test("parseRecipe: records an error when step numbers are out of order", () => {
  const result = expectFailure(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### 1. First step
*Card: Wait*
- How long: 1 hour
### 3. Third step comes second in file
*Card: Wait*
- How long: 2 hours
### 2. Second step comes third in file
*Card: Wait*
- How long: 3 hours
  `)
  // All three steps are still returned — parser never drops steps
  assertEquals(result.partialRecipe.steps?.length, 3)
  // But errors are recorded for the steps with wrong numbers
  assertGreater(result.errors.length, 0)
  const errorText = result.errors.join(' ')
  assertEquals(errorText.includes('sequential'), true)
})

Deno.test("parseRecipe: records an error when step numbers are duplicated", () => {
  const result = expectFailure(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### 1. First step
*Card: Wait*
- How long: 1 hour
### 1. Another step also numbered 1
*Card: Wait*
- How long: 2 hours
  `)
  assertEquals(result.partialRecipe.steps?.length, 2)
  assertGreater(result.errors.length, 0)
  const errorText = result.errors.join(' ')
  assertEquals(errorText.includes('sequential'), true)
})

// --- Fix C: line numbers in error messages ---

Deno.test("parseRecipe: includes a line number when a step heading cannot be parsed", () => {
  const result = expectFailure(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### Bad heading with no number
*Card: Wait*
- How long: 1 hour
  `)
  assertGreater(result.errors.length, 0)
  const errorText = result.errors.join(' ')
  assertEquals(errorText.includes('Line'), true)
})

Deno.test("parseRecipe: includes a line number when a step has no card declaration", () => {
  const result = expectFailure(`
# Test Recipe
> Test purpose.
## Kitchen
- None
## Steps
### 1. A step with no card
- How long: 1 hour
  `)
  assertGreater(result.errors.length, 0)
  const errorText = result.errors.join(' ')
  assertEquals(errorText.includes('Line'), true)
})
