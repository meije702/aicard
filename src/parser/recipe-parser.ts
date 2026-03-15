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
  const sectionLines = extractSection(lines, '## Kitchen')
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
  const sectionLines = extractSection(lines, '## Steps')

  if (sectionLines.length === 0) {
    errors.push('Recipe is missing a Steps section. Add ## Steps with at least one step.')
    return []
  }

  // Split the section into individual step blocks, each starting with ### N. Name
  const stepBlocks = splitIntoStepBlocks(sectionLines)
  return stepBlocks.map(block => parseStepBlock(block, errors)).filter(Boolean) as RecipeStep[]
}

// Extract the lines belonging to a named section (e.g. "## Steps").
// Returns the lines between this section heading and the next ## heading.
function extractSection(lines: string[], heading: string): string[] {
  const result: string[] = []
  let inSection = false

  for (const line of lines) {
    if (line.trim() === heading) {
      inSection = true
      continue
    }
    // Stop at the next level-2 heading
    if (inSection && /^##\s/.test(line) && line.trim() !== heading) {
      break
    }
    if (inSection) {
      result.push(line)
    }
  }

  return result
}

// Split section lines into blocks, each starting with a ### heading.
// Lines that appear before the first ### heading (e.g. blank lines at the
// top of the section) are ignored — they are not part of any step.
function splitIntoStepBlocks(lines: string[]): string[][] {
  const blocks: string[][] = []
  let current: string[] | null = null

  for (const line of lines) {
    if (/^###\s/.test(line)) {
      if (current !== null) blocks.push(current)
      current = [line]
    } else if (current !== null) {
      current.push(line)
    }
    // Lines before the first ### heading are ignored
  }
  if (current !== null) blocks.push(current)

  return blocks
}

// Parse a single step block into a CardStep or SubRecipeStep.
function parseStepBlock(block: string[], errors: string[]): RecipeStep | null {
  const headingLine = block[0]
  // ### N. Step name
  const headingMatch = headingLine.match(/^###\s+(\d+)\.\s+(.+)$/)
  if (!headingMatch) {
    errors.push(`Could not parse step heading: "${headingLine}"`)
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

  errors.push(`Step "${name}" has no card or recipe declaration. Add a line like: *Card: Listen*`)
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
