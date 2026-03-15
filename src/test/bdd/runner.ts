// BDD test runner: parses .feature files with @cucumber/gherkin and
// executes scenarios as Deno.test() calls using the step registry.

import {
  Parser,
  AstBuilder,
  GherkinClassicTokenMatcher,
} from '@cucumber/gherkin'
import * as IdGenerator from '@cucumber/messages'
import { executeStep, clearSteps } from './step-registry.ts'
import { World } from './world.ts'

// Parse a .feature file string into a GherkinDocument AST
function parseFeature(featureText: string) {
  const newId = IdGenerator.IdGenerator.incrementing()
  const builder = new AstBuilder(newId)
  const matcher = new GherkinClassicTokenMatcher()
  const parser = new Parser(builder, matcher)
  return parser.parse(featureText)
}

// Expand a Scenario Outline's Examples into concrete scenarios.
// Each row in the Examples table produces one scenario with placeholders
// replaced by the row's values.
interface ConcreteStep {
  text: string
  docString?: string
}

interface ConcreteScenario {
  name: string
  steps: ConcreteStep[]
}

function expandScenarios(scenario: {
  name: string
  steps: readonly { text: string; docString?: { content: string } }[]
  examples: readonly {
    tableHeader?: { cells: readonly { value: string }[] }
    tableBody: readonly { cells: readonly { value: string }[] }[]
  }[]
}): ConcreteScenario[] {
  if (scenario.examples.length === 0) {
    return [{
      name: scenario.name,
      steps: scenario.steps.map(s => ({
        text: s.text,
        docString: s.docString?.content,
      })),
    }]
  }

  const results: ConcreteScenario[] = []

  for (const example of scenario.examples) {
    if (!example.tableHeader) continue
    const headers = example.tableHeader.cells.map(c => c.value)

    for (const row of example.tableBody) {
      const values = row.cells.map(c => c.value)
      const replacements = new Map<string, string>()
      headers.forEach((h, i) => replacements.set(`<${h}>`, values[i]))

      const name = replaceAll(scenario.name, replacements)
      const steps = scenario.steps.map(s => ({
        text: replaceAll(s.text, replacements),
        docString: s.docString?.content,
      }))
      results.push({ name, steps })
    }
  }

  return results
}

function replaceAll(text: string, replacements: Map<string, string>): string {
  let result = text
  for (const [key, value] of replacements) {
    result = result.split(key).join(value)
  }
  return result
}

// Run all scenarios in a .feature file as Deno.test() calls.
// Call this at the top level of a .steps.ts file after registering steps.
export function runFeature(featurePath: string): void {
  // Read the feature file eagerly so Deno.test registrations happen synchronously
  const featureText = Deno.readTextFileSync(
    new URL(featurePath, import.meta.url).pathname.startsWith('/')
      ? new URL(featurePath, import.meta.url)
      : featurePath
  )

  const document = parseFeature(featureText)
  const feature = document.feature

  if (!feature) {
    throw new Error(`No Feature found in ${featurePath}`)
  }

  for (const child of feature.children) {
    const scenario = child.scenario
    if (!scenario) continue

    const concretes = expandScenarios(scenario)

    for (const concrete of concretes) {
      Deno.test(`${feature.name} > ${concrete.name}`, async () => {
        const world = new World()
        for (const step of concrete.steps) {
          await executeStep(world, step.text, step.docString)
        }
      })
    }
  }
}

// Run a feature from inline text (useful for testing the runner itself)
export function runFeatureFromText(featureText: string): void {
  const document = parseFeature(featureText)
  const feature = document.feature

  if (!feature) {
    throw new Error('No Feature found in provided text')
  }

  for (const child of feature.children) {
    const scenario = child.scenario
    if (!scenario) continue

    const concretes = expandScenarios(scenario)

    for (const concrete of concretes) {
      Deno.test(`${feature.name} > ${concrete.name}`, async () => {
        const world = new World()
        for (const step of concrete.steps) {
          await executeStep(world, step.text, step.docString)
        }
      })
    }
  }
}

export { clearSteps }
