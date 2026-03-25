// Tour prompts: builds the prompt for each recipe tour stop.
// Each stop targets a real UI element (header, equipment, step, run area)
// and generates a short explanation for the popover.

import type { Recipe, Kitchen, TourStop } from '../types.ts'
import { checkRecipeReadiness } from '../runner/recipe-readiness.ts'

// Card type labels in recipe language
const CARD_LABELS: Record<string, string> = {
  listen: 'Listen',
  wait: 'Wait',
  'send-message': 'Send Message',
}

// Build the list of tour stops for a recipe.
// Order: header → equipment → each step → run area.
export function buildTourStopList(recipe: Recipe): { targetSelector: string; stopType: string; stepIndex?: number }[] {
  const stops: { targetSelector: string; stopType: string; stepIndex?: number }[] = []

  stops.push({ targetSelector: 'recipe-header', stopType: 'header' })

  if (recipe.kitchen.length > 0) {
    stops.push({ targetSelector: 'equipment', stopType: 'equipment' })
  }

  for (let i = 0; i < recipe.steps.length; i++) {
    stops.push({ targetSelector: `step-${i}`, stopType: 'step', stepIndex: i })
  }

  stops.push({ targetSelector: 'run-area', stopType: 'run-area' })

  return stops
}

// Build a prompt for the sous chef to generate tour stop content.
export function buildTourStopPrompt(
  recipe: Recipe,
  kitchen: Kitchen,
  stopType: string,
  stepIndex?: number,
): string {
  const base = `You are generating content for a guided tour popover. Keep it short: a title (5-8 words) and a body (1-3 sentences). Use recipe language only. Respond with ONLY a JSON object: {"title": "...", "body": "..."}`

  switch (stopType) {
    case 'header':
      return `${base}\n\nThis stop introduces the recipe.\nRecipe name: "${recipe.name}"\nPurpose: "${recipe.purpose}"\nIt has ${recipe.steps.length} steps and needs: ${recipe.kitchen.join(', ') || 'no equipment'}.\n\nExplain what this recipe does at a high level.`

    case 'equipment': {
      const connected = kitchen.equipment
        .filter(e => e.connected && recipe.kitchen.some(k => k.toLowerCase() === e.name.toLowerCase()))
        .map(e => e.name)
      const missing = recipe.kitchen.filter(
        name => !kitchen.equipment.some(e => e.name.toLowerCase() === name.toLowerCase() && e.connected)
      )
      return `${base}\n\nThis stop explains what equipment the recipe needs.\nNeeded: ${recipe.kitchen.join(', ')}\nConnected: ${connected.join(', ') || 'none'}\nMissing: ${missing.join(', ') || 'none'}\n\nExplain what each piece of equipment is used for in this recipe.`
    }

    case 'step': {
      const step = recipe.steps[stepIndex!]
      if ('card' in step) {
        const configSummary = Object.entries(step.config)
          .map(([k, v]) => `${k}: ${v}`)
          .join(', ')
        return `${base}\n\nThis stop explains step ${step.number}: "${step.name}".\nCard type: ${step.card}\nSettings: ${configSummary || 'none'}\n\nExplain what this step does in plain language.`
      }
      // Sub-recipe step
      return `${base}\n\nThis stop explains step ${step.number}: "${step.name}".\nThis step runs another recipe called "${step.recipe}".\n\nExplain briefly.`
    }

    case 'run-area': {
      const { ready, blockers } = checkRecipeReadiness(recipe, kitchen)
      if (ready) {
        return `${base}\n\nThis stop is the Run button.\nThe kitchen is ready — everything is connected.\n\nTell the user they can hit Run to start the recipe.`
      }
      const missingList = blockers.map(b => b.label).join(', ')
      return `${base}\n\nThis stop is the Run button.\nThe recipe can't run yet. Missing: ${missingList}.\n\nExplain what needs to happen before they can run.`
    }

    default:
      return `${base}\n\nGenerate a brief explanation for this part of the recipe.`
  }
}

// Build fallback tour stops from recipe data (no LLM needed).
export function buildFallbackTourStops(recipe: Recipe, kitchen: Kitchen): TourStop[] {
  const stopList = buildTourStopList(recipe)
  return stopList.map(stop => buildFallbackStop(recipe, kitchen, stop.stopType, stop.stepIndex))
}

function buildFallbackStop(recipe: Recipe, kitchen: Kitchen, stopType: string, stepIndex?: number): TourStop {
  switch (stopType) {
    case 'header':
      return {
        title: recipe.name,
        body: recipe.purpose || `This recipe has ${recipe.steps.length} steps.`,
        targetSelector: 'recipe-header',
      }

    case 'equipment': {
      const items = recipe.kitchen.map(name => {
        const connected = kitchen.equipment.some(
          e => e.name.toLowerCase() === name.toLowerCase() && e.connected
        )
        return `- **${name}**: ${connected ? 'Connected ✓' : 'Not connected yet'}`
      })
      return {
        title: 'Equipment needed',
        body: items.join('\n'),
        targetSelector: 'equipment',
      }
    }

    case 'step': {
      const step = recipe.steps[stepIndex!]
      if ('card' in step) {
        const label = CARD_LABELS[step.card] ?? step.card
        return {
          title: `Step ${step.number}: ${step.name}`,
          body: `This is a **${label}** card. ${describeCard(step.card, step.config)}`,
          targetSelector: `step-${stepIndex}`,
        }
      }
      return {
        title: `Step ${step.number}: ${step.name}`,
        body: `This step runs the **${step.recipe}** recipe.`,
        targetSelector: `step-${stepIndex}`,
      }
    }

    case 'run-area': {
      const { ready, blockers } = checkRecipeReadiness(recipe, kitchen)
      if (ready) {
        return {
          title: "You're ready to go",
          body: 'Everything is connected. Hit **Run recipe** to start.',
          targetSelector: 'run-area',
        }
      }
      const missing = blockers.map(b => b.label).join(', ')
      return {
        title: 'Almost there',
        body: `Connect ${missing} before you can run this recipe.`,
        targetSelector: 'run-area',
      }
    }

    default:
      return { title: '', body: '', targetSelector: '' }
  }
}

// Describe a card step using its actual config keys.
// The recipe parser normalises keys to lowercase, so we match against
// the real keys: "listen for", "from", "how long", "to", "subject", "message".
function describeCard(card: string, config: Record<string, string>): string {
  switch (card) {
    case 'listen': {
      const listenFor = config['listen for']
      const from = config['from']
      if (listenFor && from) return `It listens for **${listenFor}** from **${from}**.`
      if (listenFor) return `It listens for **${listenFor}**.`
      return 'It waits for something to happen before continuing.'
    }
    case 'wait': {
      const howLong = config['how long']
      return howLong
        ? `It pauses for **${howLong}** before the next step. Keep the tab open.`
        : 'It pauses for a set time before the next step.'
    }
    case 'send-message': {
      const to = config['to']
      const subject = config['subject']
      if (to && subject) return `It sends a message to **${to}** with the subject "**${subject}**".`
      if (to) return `It sends a message to **${to}**.`
      return 'It composes and sends a message.'
    }
    default:
      return ''
  }
}
