// Parse the ## Steps section of a recipe file into RecipeStep objects.
// Extracted from recipe-parser.ts — step parsing is a distinct concern
// from metadata parsing (name, purpose, kitchen).

import type { RecipeStep, CardStep, SubRecipeStep, CardConfig, ParseResult } from '../types.ts'
import { KNOWN_CARD_TYPES, normaliseCardType } from './card-type.ts'
import { extractSectionWithLineInfo as extractSection } from './section-helpers.ts'

// Parse the ## Steps section into an array of RecipeStep objects.
export function parseSteps(lines: string[]): ParseResult<RecipeStep[]> {
  const { lines: sectionLines, startLine } = extractSection(lines, '## Steps')

  if (sectionLines.length === 0) {
    return {
      value: [],
      errors: ['Recipe is missing a Steps section. Add ## Steps with at least one step.'],
    }
  }

  // Split the section into individual step blocks, each starting with ### N. Name.
  // Line numbers are tracked so error messages can point to the exact location.
  const stepBlocks = splitIntoStepBlocks(sectionLines, startLine)
  const errors: string[] = []
  const steps: RecipeStep[] = []

  for (const { block, lineNumber } of stepBlocks) {
    const result = parseStepBlock(block, lineNumber)
    errors.push(...result.errors)
    if (result.value !== null) steps.push(result.value)
  }

  // Validate that step numbers form a sequential 1-based series.
  // Out-of-order or duplicate numbers are confusing — the runner processes
  // steps in file order, not by number, so mismatches hide bugs.
  for (let i = 0; i < steps.length; i++) {
    if (steps[i].number !== i + 1) {
      errors.push(
        `Step numbers must be sequential starting from 1. ` +
        `Found step number ${steps[i].number} at position ${i + 1} in the file.`
      )
    }
  }

  return { value: steps, errors }
}

// Split section lines into blocks, each starting with a ### heading.
// Lines that appear before the first ### heading (e.g. blank lines at the
// top of the section) are ignored — they are not part of any step.
//
// Returns the 1-based line number of each ### heading so error messages
// can point to the exact line in the file.
function splitIntoStepBlocks(lines: string[], sectionStartLine: number): { block: string[], lineNumber: number }[] {
  const blocks: { block: string[], lineNumber: number }[] = []
  let current: string[] | null = null
  let currentLineNumber = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^###\s/.test(line)) {
      if (current !== null) blocks.push({ block: current, lineNumber: currentLineNumber })
      current = [line]
      currentLineNumber = sectionStartLine + i
    } else if (current !== null) {
      current.push(line)
    }
    // Lines before the first ### heading are ignored
  }
  if (current !== null) blocks.push({ block: current, lineNumber: currentLineNumber })

  return blocks
}

// Parse a single step block into a CardStep or SubRecipeStep.
// lineNumber is the 1-based position of the ### heading in the source file —
// error messages include it so contributors can jump directly to the line.
function parseStepBlock(block: string[], lineNumber: number): ParseResult<RecipeStep | null> {
  const headingLine = block[0]
  // ### N. Step name
  const headingMatch = headingLine.match(/^###\s+(\d+)\.\s+(.+)$/)
  if (!headingMatch) {
    return {
      value: null,
      errors: [`Line ${lineNumber}: couldn't read this step heading. Use the format "### 1. Step name".`],
    }
  }

  const number = parseInt(headingMatch[1], 10)
  const name = headingMatch[2].trim()

  // Find the card or recipe declaration line: *Card: Type* or *Recipe: Name*
  for (let i = 1; i < block.length; i++) {
    const line = block[i].trim()

    const cardMatch = line.match(/^\*Card:\s+(.+)\*$/)
    if (cardMatch) {
      const cardType = normaliseCardType(cardMatch[1].trim())
      if (cardType === null) {
        const raw = cardMatch[1].trim()
        return {
          value: null,
          errors: [
            `Line ${lineNumber}: Step "${name}" uses unknown card type "${raw}". ` +
            `Known types: ${KNOWN_CARD_TYPES.join(', ')}.`,
          ],
        }
      }
      const config = parseConfig(block.slice(i + 1))
      const step: CardStep = { number, name, card: cardType, config }
      return { value: step, errors: [] }
    }

    const recipeMatch = line.match(/^\*Recipe:\s+(.+)\*$/)
    if (recipeMatch) {
      const step: SubRecipeStep = { number, name, recipe: recipeMatch[1].trim() }
      return { value: step, errors: [] }
    }
  }

  return {
    value: null,
    errors: [
      `Line ${lineNumber}: Step "${name}" has no card or recipe declaration. Add a line like: *Card: Listen*`,
    ],
  }
}

// Parse bullet-point config lines into a key-value map.
// Config keys are normalised to lowercase. Values are trimmed strings.
function parseConfig(lines: string[]): CardConfig {
  const config: CardConfig = {}

  for (const line of lines) {
    const match = line.match(/^-\s+(.+?):\s*(.+)$/)
    if (match) {
      const key = match[1].trim().toLowerCase()
      const value = match[2].trim()
      config[key] = value
    }
  }

  return config
}
