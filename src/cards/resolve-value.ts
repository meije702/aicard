// Resolve config values that may reference earlier step outputs.
//
// The documented format for referencing output from an earlier step is:
//   {step 1: customer email}
//
// This reads from RecipeContext, where each step's output is stored under
// the key "step N" (e.g. context["step 1"]["customer email"]).
//
// Plain string values (no curly braces) are returned as-is.

import type { CardConfig, RecipeContext } from '../types.ts'

const STEP_REF_PATTERN = /\{step\s+(\d+)\s*:\s*(.+?)\}/g

/** Resolve a single value. Unresolved references are left intact (legacy behavior). */
export function resolveValue(value: string, context: RecipeContext): string {
  if (!value.includes('{step')) return value

  return value.replace(STEP_REF_PATTERN, (_match, stepNum: string, key: string) => {
    const stepKey = `step ${stepNum}`
    const stepOutput = context[stepKey]
    if (!stepOutput) return _match // Leave the reference intact if the step hasn't run

    const trimmedKey = key.trim()
    if (trimmedKey in stepOutput) return stepOutput[trimmedKey]

    return _match // Leave intact if the key isn't in the step's output
  })
}

/** The result of resolving all config values with error tracking. */
export interface ResolveResult {
  resolved: Record<string, string>
  errors: string[]
}

/**
 * Resolve all values in a config object and report unresolved references as errors.
 *
 * Unlike resolveValue(), this function treats unresolved references as explicit
 * errors rather than silently leaving them as template strings. This is the right
 * behavior at execution time: Maria should see "Step 3 needs 'customer email' from
 * step 1, but step 1 didn't produce that output" — not a message sent to the literal
 * string "{step 1: customer email}".
 */
export function resolveAllValues(
  config: CardConfig,
  context: RecipeContext,
  stepNumber: number
): ResolveResult {
  const resolved: Record<string, string> = {}
  const errors: string[] = []

  for (const [configKey, rawValue] of Object.entries(config)) {
    if (!rawValue.includes('{step')) {
      resolved[configKey] = rawValue
      continue
    }

    let hasUnresolved = false
    const resolvedValue = rawValue.replace(
      STEP_REF_PATTERN,
      (_match, refStepNum: string, key: string) => {
        const stepKey = `step ${refStepNum}`
        const stepOutput = context[stepKey]
        const trimmedKey = key.trim()

        if (!stepOutput) {
          hasUnresolved = true
          errors.push(
            `Step ${stepNumber} needs "${trimmedKey}" from step ${refStepNum}, but step ${refStepNum} hasn't produced any output.`
          )
          return _match
        }

        if (!(trimmedKey in stepOutput)) {
          hasUnresolved = true
          errors.push(
            `Step ${stepNumber} needs "${trimmedKey}" from step ${refStepNum}, but step ${refStepNum} didn't produce that output.`
          )
          return _match
        }

        return stepOutput[trimmedKey]
      }
    )

    // Only use the resolved value if all references resolved successfully.
    // If any failed, leave the raw template so the error is visible in logs.
    resolved[configKey] = hasUnresolved ? rawValue : resolvedValue
  }

  return { resolved, errors }
}
