// The sous chef: the AI collaborator.
// Not a chatbot — a quiet helper with two interaction surfaces:
//   1. The chef's hat: contextual options based on what the user is doing
//   2. The toast: a tap on the shoulder when something genuinely needs attention
//
// The sous chef speaks recipe language. Never technical language.

import type { Recipe, Kitchen, SousChefConfig, EquipmentDefinition, WizardStepResponse, TourStop, HatOption } from '../types.ts'
import { checkRecipeReadiness, recipeHasWaitSteps } from '../runner/recipe-readiness.ts'
import {
  SOUS_CHEF_SYSTEM_PROMPT,
  buildReadinessContext,
  buildStepContext,
} from './prompts.ts'
import {
  buildEquipmentStepPrompt,
  buildFallbackStepResponse,
  EQUIPMENT_SETUP_SYSTEM_SUFFIX,
} from './equipment-prompts.ts'
import { buildTourStopPrompt, buildTourStopList } from './tour-prompts.ts'
import { parseWizardStepResponse } from '../parser/wizard-response-parser.ts'
import { sousChefAsk } from './client.ts'

// Parse the model's response into a clean list of option strings.
// Models (including Claude) often wrap JSON in ```json ... ``` fences despite
// being told not to — this handles that gracefully with three fallback tiers.
// Exported for testing. Parses the model's raw JSON response into option labels.
export function extractOptions(raw: string): string[] {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/m, '')
    .replace(/\s*```\s*$/m, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned) as { options: string[] }
    if (Array.isArray(parsed.options)) return parsed.options.slice(0, 5)
  } catch { /* continue */ }

  const match = cleaned.match(/\{[\s\S]*\}/)
  if (match) {
    try {
      const parsed = JSON.parse(match[0]) as { options: string[] }
      if (Array.isArray(parsed.options)) return parsed.options.slice(0, 5)
    } catch { /* continue */ }
  }

  return cleaned
    .split('\n')
    .map(l => l.replace(/^[-•*\d.\s]+/, '').trim())
    .filter(l => l.length > 0 && !l.startsWith('{') && !l.startsWith('`'))
    .slice(0, 5)
}

// Build the final hat options list from LLM-generated labels.
// Injects deterministic actions (tour, ask-anything) that don't depend on LLM phrasing.
// Exported for testing.
export function buildHatOptions(llmLabels: string[], hasRecipe: boolean): HatOption[] {
  const options: HatOption[] = llmLabels.map(label => ({ label }))

  if (hasRecipe) {
    options.push({ label: 'Walk me through this recipe', action: 'tour' })
  }
  options.push({ label: 'I want to ask something else', action: 'ask-anything' })

  return options
}

// The sous chef needs a provider config to run.
// In v1 this is passed in from the UI — no backend required.
export function createSousChef(config: SousChefConfig) {
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

      return await ask(config, prompt)
    },

    // Describe what a specific step is doing in plain English.
    async describeStep(
      stepName: string,
      cardType: string,
      cardConfig: Record<string, string>
    ): Promise<string> {
      const context = buildStepContext(stepName, cardType, cardConfig)
      const prompt = `Describe what this recipe step is doing in one friendly sentence. Use recipe language.\n\n${context}`
      return await ask(config, prompt)
    },

    // Generate contextual options for the chef's hat menu.
    // Returns structured HatOption objects. Special actions (tour, ask-anything)
    // are injected deterministically by the client — never inferred from LLM text.
    async getHatOptions(recipe: Recipe | null, currentStepName: string | null, kitchen?: Kitchen): Promise<HatOption[]> {
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

      // Ask the LLM for contextual options — but NOT the tour or ask-anything,
      // which are injected below as structured actions.
      const prompt = `Generate 2 to 4 short, friendly options for a helper menu. Each option should be something the user might want to know or do right now. Write them as short action phrases (e.g. "Check if my kitchen is ready"). Do NOT include options about explaining the recipe or asking something else — those are handled separately.

${context}

Respond with ONLY a JSON object in this exact format, no other text:
{"options": ["option one", "option two", "option three"]}`

      const response = await ask(config, prompt)
      const labels = extractOptions(response)

      return buildHatOptions(labels, recipe !== null)
    },

    // Guide the user through one step of equipment setup.
    // Returns a WizardStepResponse (structured JSON) for the wizard UI.
    // Falls back to the .equipment.md content if the model returns bad JSON.
    async guideEquipmentStep(
      equipmentDef: EquipmentDefinition,
      stepNumber: number,
      collectedConfig: Record<string, string>,
    ): Promise<WizardStepResponse> {
      const prompt = buildEquipmentStepPrompt(equipmentDef, stepNumber, collectedConfig)
      const systemPrompt = SOUS_CHEF_SYSTEM_PROMPT + '\n\n' + EQUIPMENT_SETUP_SYSTEM_SUFFIX

      try {
        const raw = await sousChefAsk(config, systemPrompt, prompt)
        const { response, errors } = parseWizardStepResponse(raw)

        // If parsing produced errors but we still got an instruction, use it
        if (errors.length > 0 && !response.instruction) {
          return buildFallbackStepResponse(equipmentDef, stepNumber)
        }
        return response
      } catch {
        // Model unreachable — use the .equipment.md content directly
        return buildFallbackStepResponse(equipmentDef, stepNumber)
      }
    },

    // Generate content for a single recipe tour stop.
    // Returns a TourStop with title, body, and target selector.
    async generateTourStop(
      recipe: Recipe,
      kitchen: Kitchen,
      stopIndex: number,
    ): Promise<TourStop> {
      const stopList = buildTourStopList(recipe)
      const stop = stopList[stopIndex]
      if (!stop) throw new Error(`Invalid tour stop index: ${stopIndex}`)

      const prompt = buildTourStopPrompt(recipe, kitchen, stop.stopType, stop.stepIndex)

      try {
        const raw = await ask(config, prompt)
        // Parse JSON response
        const cleaned = raw
          .replace(/^```(?:json)?\s*/m, '')
          .replace(/\s*```\s*$/m, '')
          .trim()
        const match = cleaned.match(/\{[\s\S]*\}/)
        if (match) {
          const parsed = JSON.parse(match[0]) as { title: string; body: string }
          if (parsed.title && parsed.body) {
            return { title: parsed.title, body: parsed.body, targetSelector: stop.targetSelector }
          }
        }
      } catch {
        // Fall through to error
      }

      throw new Error('Could not generate tour stop')
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

      return await ask(config, prompt)
    },
  }
}

// Internal helper: make a single request via the selected provider.
async function ask(config: SousChefConfig, userMessage: string): Promise<string> {
  return sousChefAsk(config, SOUS_CHEF_SYSTEM_PROMPT, userMessage)
}
