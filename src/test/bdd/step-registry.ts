// Step registry for BDD tests.
// Provides Given/When/Then registration functions that map Gherkin step text
// to handler functions. Supports {string} and {int} parameter placeholders.

import type { World } from './world.ts'

// A step handler receives the World and any captured parameters
export type StepHandler = (world: World, ...args: string[]) => void | Promise<void>

interface RegisteredStep {
  pattern: RegExp
  handler: StepHandler
  original: string
}

const steps: RegisteredStep[] = []

// Convert a Gherkin-style pattern string to a RegExp.
// Supports {string} (captures quoted text) and {int} (captures digits).
function toRegExp(pattern: string): RegExp {
  const escaped = pattern
    .replace(/[.*+?^${}()|[\]\\]/g, (match) => {
      if (match === '{' || match === '}') return match
      return `\\${match}`
    })
    .replace(/\{string\}/g, '"([^"]*)"')
    .replace(/\{int\}/g, '(\\d+)')
  return new RegExp(`^${escaped}$`)
}

function register(pattern: string, handler: StepHandler): void {
  steps.push({ pattern: toRegExp(pattern), handler, original: pattern })
}

export function Given(pattern: string, handler: StepHandler): void {
  register(pattern, handler)
}

export function When(pattern: string, handler: StepHandler): void {
  register(pattern, handler)
}

export function Then(pattern: string, handler: StepHandler): void {
  register(pattern, handler)
}

// Find and execute the step handler matching the given text.
// If a docString is provided, it is appended as the last argument.
// Throws if no matching step is found.
export async function executeStep(world: World, text: string, docString?: string): Promise<void> {
  for (const step of steps) {
    const match = text.match(step.pattern)
    if (match) {
      const captures = match.slice(1)
      if (docString !== undefined) captures.push(docString)
      await step.handler(world, ...captures)
      return
    }
  }
  throw new Error(`No step definition found for: "${text}"`)
}

// Clear all registered steps. Used between test files to avoid collisions.
export function clearSteps(): void {
  steps.length = 0
}
