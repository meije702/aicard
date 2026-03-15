// The sous chef: the AI collaborator.
// Not a chatbot — a quiet helper with two interaction surfaces:
//   1. The chef's hat: contextual options based on what the user is doing
//   2. The toast: a tap on the shoulder when something genuinely needs attention
//
// The sous chef speaks recipe language. Never technical language.

import Anthropic from '@anthropic-ai/sdk'
import type { Recipe, Kitchen } from '../types.ts'
import { checkRecipeReadiness, recipeHasWaitSteps } from '../runner/recipe-runner.ts'
import {
  SOUS_CHEF_SYSTEM_PROMPT,
  buildReadinessContext,
  buildStepContext,
} from './prompts.ts'

// The sous chef needs an API key to run.
// In v1 this is passed in from the UI — no backend required.
export function createSousChef(apiKey: string) {
  const client = new Anthropic({ apiKey, dangerouslyAllowBrowser: true })

  return {
    // Check whether the kitchen is ready to run the recipe.
    // Returns a plain-English description of what is ready and what is missing.
    async checkKitchenReadiness(recipe: Recipe, kitchen: Kitchen): Promise<string> {
      const { ready, blockers } = checkRecipeReadiness(recipe, kitchen)
      const connectedNames = kitchen.equipment
        .filter(e => e.connected)
        .map(e => e.name)
      const equipmentBlockers = blockers.filter(b => b.kind === 'equipment')
      const cardTypeBlockers = blockers.filter(b => b.kind === 'card-type')

      const context = buildReadinessContext(
        recipe.name,
        recipe.kitchen,
        connectedNames,
        blockers.map(b => b.label)
      )

      let prompt: string
      if (ready) {
        prompt = `The kitchen is fully ready to run this recipe. Tell the user what the recipe will do in plain English, step by step. Be brief and warm.\n\n${context}`
      } else if (cardTypeBlockers.length > 0 && equipmentBlockers.length === 0) {
        const cardList = cardTypeBlockers.map(b => `"${b.label}"`).join(', ')
        prompt = `This recipe uses card types that are not in the pantry: ${cardList}. Explain to the user that they need to add these cards to their pantry before this recipe can run. Use recipe language only.\n\n${context}`
      } else if (cardTypeBlockers.length > 0) {
        const equipList = equipmentBlockers.map(b => b.label).join(', ')
        const cardList = cardTypeBlockers.map(b => `"${b.label}"`).join(', ')
        prompt = `The recipe has two kinds of problems: missing equipment (${equipList}) and card types not in the pantry (${cardList}). Explain both clearly to the user in plain recipe language.\n\n${context}`
      } else {
        prompt = `The kitchen is missing some equipment. Tell the user what is missing and what they need to do to get ready.\n\n${context}`
      }

      return await ask(client, prompt)
    },

    // Describe what a specific step is doing in plain English.
    async describeStep(
      stepName: string,
      cardType: string,
      config: Record<string, string>
    ): Promise<string> {
      const context = buildStepContext(stepName, cardType, config)
      const prompt = `Describe what this recipe step is doing in one friendly sentence. Use recipe language.\n\n${context}`
      return await ask(client, prompt)
    },

    // Generate contextual options for the chef's hat menu.
    // Returns 3–5 plain-English options the user can tap.
    // Uses structured JSON output so the response is always a typed array —
    // no fragile regex parsing of bulleted lists.
    async getHatOptions(recipe: Recipe | null, currentStepName: string | null, kitchen?: Kitchen): Promise<string[]> {
      const parts: string[] = []

      if (recipe) {
        parts.push(`The user is viewing the recipe "${recipe.name}".`)
        parts.push(`Current step: "${currentStepName ?? 'none'}".`)

        // Add readiness context if kitchen is available
        if (kitchen) {
          const { ready, blockers } = checkRecipeReadiness(recipe, kitchen)
          if (ready) {
            parts.push('The kitchen is ready — all equipment is connected.')
          } else {
            const equipmentMissing = blockers.filter(b => b.kind === 'equipment').map(b => b.label)
            const cardsMissing = blockers.filter(b => b.kind === 'card-type').map(b => b.label)
            const notReadyParts: string[] = []
            if (equipmentMissing.length > 0) notReadyParts.push(`Missing equipment: ${equipmentMissing.join(', ')}`)
            if (cardsMissing.length > 0) notReadyParts.push(`Cards not in the pantry: ${cardsMissing.join(', ')}`)
            parts.push(`The kitchen is NOT ready. ${notReadyParts.join('. ')}.`)
          }
        }
      } else {
        parts.push('The user has no recipe open.')
      }

      const context = parts.join(' ')

      const prompt = `Generate 3 to 5 short, friendly options for a helper menu. Each option should be something the user might want to know or do right now. Write them as short action phrases (e.g. "Check if my kitchen is ready"). Always include "I want to ask something else" as the last option.

${context}

Respond with ONLY a JSON object in this exact format, no other text:
{"options": ["option one", "option two", "option three"]}`

      const response = await ask(client, prompt)

      try {
        const parsed = JSON.parse(response) as { options: string[] }
        if (Array.isArray(parsed.options)) return parsed.options.slice(0, 5)
      } catch {
        // If JSON parsing fails, fall back to splitting on newlines
        return response.split('\n').map(l => l.trim()).filter(l => l.length > 0).slice(0, 5)
      }

      return []
    },

    // Answer a free-form question from the user.
    async ask(question: string, recipe: Recipe | null, _kitchen: Kitchen): Promise<string> {
      const kitchenContext = recipe
        ? `The user has the recipe "${recipe.name}" open. It has ${recipe.steps.length} steps and needs: ${recipe.kitchen.join(', ') || 'no equipment'}.`
        : 'The user has no recipe open.'

      const hasWaitWarning = recipe && recipeHasWaitSteps(recipe)
        ? 'This recipe has a Wait step, which means the browser tab must stay open while it runs.'
        : ''

      const context = [kitchenContext, hasWaitWarning].filter(Boolean).join(' ')
      const prompt = `${context}\n\nUser question: ${question}`

      return await ask(client, prompt)
    },
  }
}

// Make a single request to the sous chef model.
async function ask(client: Anthropic, userMessage: string): Promise<string> {
  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SOUS_CHEF_SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  })

  const block = response.content[0]
  if (block.type === 'text') return block.text
  return ''
}
