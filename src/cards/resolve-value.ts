// Resolve config values that may reference earlier step outputs.
//
// The documented format for referencing output from an earlier step is:
//   {step 1: customer email}
//
// This reads from RecipeContext, where each step's output is stored under
// the key "step N" (e.g. context["step 1"]["customer email"]).
//
// Plain string values (no curly braces) are returned as-is.

import type { RecipeContext } from '../types.ts'

const STEP_REF_PATTERN = /\{step\s+(\d+)\s*:\s*(.+?)\}/g

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
