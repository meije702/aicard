// Parse a .recipe.md file into a Recipe object.
// See docs/AICard_Recipe_Format.md for the format specification.
//
// Design rule: never throw. If a section is missing or malformed, record the
// problem in recipe.errors[] and continue with sensible defaults.

import type { Recipe, RecipeStep, CardStep, SubRecipeStep, CardType, CardConfig } from '../types.ts'

export function parseRecipe(markdown: string): Recipe {
  const lines = markdown.split('\n')
  const errors: string[] = []

  const name = parseName(lines, errors)
  const purpose = parsePurpose(lines)
  const kitchen = parseKitchen(lines)
  const steps = parseSteps(lines, errors)

  return { name, purpose, kitchen, steps, errors }
}

// Parse the recipe name from the first level-1 heading: # Title
function parseName(lines: string[], errors: string[]): string {
  for (const line of lines) {
    const match = line.match(/^#\s+(.+)$/)
    if (match) return match[1].trim()
  }
  errors.push('Recipe is missing a title. Add a line like: # Recipe Name')
  return ''
}

// Parse the purpose from the first blockquote: > One sentence.
function parsePurpose(lines: string[]): string {
  for (const line of lines) {
    const match = line.match(/^>\s+(.+)$/)
    if (match) return match[1].trim()
  }
  return ''
}

// Parse the ## Kitchen section into a list of equipment names.
function parseKitchen(lines: string[]): string[] {
  const { lines: sectionLines } = extractSection(lines, '## Kitchen')
  if (sectionLines.length === 0) return []

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
  return equipment
}

// Parse the ## Steps section into an array of RecipeStep objects.
function parseSteps(lines: string[], errors: string[]): RecipeStep[] {
  const { lines: sectionLines, startLine } = extractSection(lines, '## Steps')

  if (sectionLines.length === 0) {
    errors.push('Recipe is missing a Steps section. Add ## Steps with at least one step.')
    return []
  }

  // Split the section into individual step blocks, each starting with ### N. Name.
  // Line numbers are tracked so error messages can point to the exact location.
  const stepBlocks = splitIntoStepBlocks(sectionLines, startLine)
  const steps = stepBlocks
    .map(({ block, lineNumber }) => parseStepBlock(block, lineNumber, errors))
    .filter(Boolean) as RecipeStep[]

  // Fix B: validate that step numbers form a sequential 1-based series.
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

  return steps
}

// Extract the lines belonging to a named section (e.g. "## Steps").
// Returns the lines between this section heading and the next ## heading,
// plus the 1-based line number of the first content line (for error messages).
//
// Fix A: comparison is case-insensitive so "## kitchen" and "## KITCHEN"
// both match "## Kitchen" — the parser accepts the section regardless of case.
function extractSection(lines: string[], heading: string): { lines: string[], startLine: number } {
  const result: string[] = []
  let inSection = false
  let startLine = 0

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.trim().toLowerCase() === heading.toLowerCase()) {
      inSection = true
      startLine = i + 2  // 1-based; the content starts on the next line
      continue
    }
    // Stop at the next level-2 heading
    if (inSection && /^##\s/.test(line) && line.trim().toLowerCase() !== heading.toLowerCase()) {
      break
    }
    if (inSection) {
      result.push(line)
    }
  }

  return { lines: result, startLine }
}

// Split section lines into blocks, each starting with a ### heading.
// Lines that appear before the first ### heading (e.g. blank lines at the
// top of the section) are ignored — they are not part of any step.
//
// Fix C: returns the 1-based line number of each ### heading so error
// messages can point to the exact line in the file.
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
// Fix C: lineNumber is the 1-based position of the ### heading in the source
// file. Error messages include it so contributors can jump directly to the line.
function parseStepBlock(block: string[], lineNumber: number, errors: string[]): RecipeStep | null {
  const headingLine = block[0]
  // ### N. Step name
  const headingMatch = headingLine.match(/^###\s+(\d+)\.\s+(.+)$/)
  if (!headingMatch) {
    errors.push(`Line ${lineNumber}: Could not parse step heading: "${headingLine}"`)
    return null
  }

  const number = parseInt(headingMatch[1], 10)
  const name = headingMatch[2].trim()

  // Find the card or recipe declaration line: *Card: Type* or *Recipe: Name*
  for (let i = 1; i < block.length; i++) {
    const line = block[i].trim()

    const cardMatch = line.match(/^\*Card:\s+(.+)\*$/)
    if (cardMatch) {
      const cardType = normaliseCardType(cardMatch[1].trim())
      const config = parseConfig(block.slice(i + 1))
      const step: CardStep = { number, name, card: cardType, config }
      return step
    }

    const recipeMatch = line.match(/^\*Recipe:\s+(.+)\*$/)
    if (recipeMatch) {
      // Sub-recipes are parsed correctly but not supported in v1.
      // Flag at parse time so the user sees it before they try to run.
      errors.push(
        `Step "${name}" uses a sub-recipe ("${recipeMatch[1].trim()}"), which is not yet supported. ` +
        `This step will be skipped when the recipe runs.`
      )
      const step: SubRecipeStep = { number, name, recipe: recipeMatch[1].trim() }
      return step
    }
  }

  errors.push(
    `Line ${lineNumber}: Step "${name}" has no card or recipe declaration. Add a line like: *Card: Listen*`
  )
  return null
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

// Normalise a card type name to lowercase-hyphenated.
// "Send Message" → "send-message", "Listen" → "listen", "Wait" → "wait"
function normaliseCardType(raw: string): CardType {
  const normalised = raw.toLowerCase().replace(/\s+/g, '-')
  // TRADE-OFF: we cast to CardType here. Unknown card types will surface at
  // execution time, not parse time. This keeps the parser simple and lets
  // recipe files reference card types that haven't been installed yet.
  return normalised as CardType
}
