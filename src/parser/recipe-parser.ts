// Parse a .recipe.md file into a Recipe object.
// See docs/AICard_Recipe_Format.md for the format specification.
//
// Design rule: never throw. If a section is missing or malformed, record the
// problem and continue with sensible defaults.
//
// Each helper returns a ParseResult<T> — { value, errors } — rather than
// accepting a mutable errors array. parseRecipe merges all returned errors.
//
// Step parsing (block splitting, card/recipe detection, config extraction)
// lives in parse-steps.ts — a separate concern from metadata parsing.

import type { Recipe, ParseResult, ParsedRecipe } from '../types.ts'
import { extractSectionWithLineInfo as extractSection } from './section-helpers.ts'
import { parseSteps } from './parse-steps.ts'

export function parseRecipe(markdown: string): ParsedRecipe {
  // Split on \r?\n so Windows (CRLF) files parse identically to Unix (LF).
  // Without this, a trailing \r defeats the ^...$ heading regexes and a valid
  // recipe is rejected with a misleading "missing title" error.
  const lines = markdown.split(/\r?\n/)

  const nameResult  = parseName(lines)
  const purposeResult = parsePurpose(lines)
  const kitchenResult = parseKitchen(lines)
  const stepsResult = parseSteps(lines)

  const allErrors = [
    ...nameResult.errors,
    ...purposeResult.errors,
    ...kitchenResult.errors,
    ...stepsResult.errors,
  ]

  const partialRecipe: Partial<Recipe> = {
    name:    nameResult.value,
    purpose: purposeResult.value,
    kitchen: kitchenResult.value,
    steps:   stepsResult.value,
    errors:  allErrors,
  }

  if (allErrors.length > 0) {
    return { success: false, errors: allErrors, partialRecipe }
  }

  return {
    success: true,
    recipe: {
      name:    nameResult.value,
      purpose: purposeResult.value,
      kitchen: kitchenResult.value,
      steps:   stepsResult.value,
      errors:  [],
    },
  }
}

// Parse the recipe name from the first level-1 heading: # Title
function parseName(lines: string[]): ParseResult<string> {
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/)
    if (match) return { value: match[1].trim(), errors: [] }
  }
  return {
    value: '',
    errors: ['Recipe is missing a title. Add a line like: # Recipe Name'],
  }
}

// Parse the purpose from the first blockquote: > One sentence.
function parsePurpose(lines: string[]): ParseResult<string> {
  for (const line of lines) {
    const match = line.match(/^>\s+(.+)$/)
    if (match) return { value: match[1].trim(), errors: [] }
  }
  return { value: '', errors: [] }
}

// Parse the ## Kitchen section into a list of equipment names.
function parseKitchen(lines: string[]): ParseResult<string[]> {
  const { lines: sectionLines } = extractSection(lines, '## Kitchen')
  if (sectionLines.length === 0) return { value: [], errors: [] }

  const equipment: string[] = []
  for (const line of sectionLines) {
    const match = line.match(/^-\s+(.+)$/)
    if (match) {
      const name = match[1].trim()
      // Skip "None" or "None." as a signal that no equipment is needed
      if (name.toLowerCase() !== 'none' && name.toLowerCase() !== 'none.') {
        equipment.push(name)
      }
    }
  }
  return { value: equipment, errors: [] }
}
