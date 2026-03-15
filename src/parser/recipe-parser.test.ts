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

// --- thank-you-follow-up fixture ---

Deno.test("parseRecipe: parses the recipe name from the title heading", () => {
  const recipe = parseRecipe(thankyouFixture)
  assertEquals(recipe.name, 'Thank You Follow-Up')
})

Deno.test("parseRecipe: parses the purpose from the blockquote", () => {
  const recipe = parseRecipe(thankyouFixture)
  assertEquals(
    recipe.purpose,
    'Send a personalised thank you message to new customers three days after their first purchase.'
  )
})

Deno.test("parseRecipe: parses the kitchen equipment list", () => {
  const recipe = parseRecipe(thankyouFixture)
  assertEquals(recipe.kitchen, ['Shopify', 'Gmail'])
})

Deno.test("parseRecipe: parses the correct number of steps", () => {
  const recipe = parseRecipe(thankyouFixture)
  assertEquals(recipe.steps.length, 3)
})

Deno.test("parseRecipe: parses the first step as a Listen card", () => {
  const recipe = parseRecipe(thankyouFixture)
  const step = asCardStep(recipe.steps[0])
  assertEquals(step.card, 'listen')
  assertEquals(step.name, 'Listen for a new order')
})

Deno.test("parseRecipe: parses the second step as a Wait card with config", () => {
  const recipe = parseRecipe(thankyouFixture)
  const step = asCardStep(recipe.steps[1])
  assertEquals(step.card, 'wait')
  assertEquals(step.config['how long'], '3 days')
})

Deno.test("parseRecipe: parses the third step as a Send Message card", () => {
  const recipe = parseRecipe(thankyouFixture)
  const step = asCardStep(recipe.steps[2])
  assertEquals(step.card, 'send-message')
  assertEquals(step.config['to'], '{step 1: customer email}')
})

Deno.test("parseRecipe: returns no errors for a well-formed recipe", () => {
  const recipe = parseRecipe(thankyouFixture)
  assertEquals(recipe.errors.length, 0)
})

// --- community-message-router fixture ---

Deno.test("parseRecipe: parses community recipe name and steps", () => {
  const recipe = parseRecipe(communityFixture)
  assertEquals(recipe.name, 'Community Message Router')
  assertEquals(recipe.steps.length, 2)
})

Deno.test("parseRecipe: parses community recipe equipment", () => {
  const recipe = parseRecipe(communityFixture)
  assertEquals(recipe.kitchen.includes('Discord'), true)
  assertEquals(recipe.kitchen.includes('Gmail'), true)
})

// --- card type normalisation ---

Deno.test("parseRecipe: normalises card type names to lowercase-hyphenated", () => {
  const recipe = parseRecipe(`
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
  const recipe = parseRecipe(`
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

// --- graceful handling of incomplete recipes ---

Deno.test("parseRecipe: returns sensible defaults when Kitchen section is missing", () => {
  const recipe = parseRecipe(`
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

Deno.test("parseRecipe: adds an error when the title is missing but does not throw", () => {
  const recipe = parseRecipe(`
> A recipe with no title.
## Steps
### 1. Wait
*Card: Wait*
- How long: 1 hour
  `)
  assertEquals(recipe.name, '')
  assertGreater(recipe.errors.length, 0)
})

Deno.test("parseRecipe: returns an empty steps array when Steps section is missing", () => {
  const recipe = parseRecipe(`
# No Steps Recipe
> This recipe has no steps.
## Kitchen
- None
  `)
  assertEquals(recipe.steps, [])
  assertGreater(recipe.errors.length, 0)
})
